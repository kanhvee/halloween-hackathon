import { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, MapPin, Users, Leaf, Drumstick, Clock,
  CalendarCheck, CalendarX, Loader2, Check, X, MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Cook, Menu, Review, Subscription, Skip } from '@/types';

interface CookDetailProps {
  cook: Cook;
  onBack: () => void;
}

const CUTOFF_HOUR = 21;

export default function CookDetail({ cook, onBack }: CookDetailProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [skips, setSkips] = useState<Skip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [cook.id]);

  async function loadData() {
    setLoading(true);
    const [menusRes, reviewsRes] = await Promise.all([
      supabase.from('menus').select('*').eq('cook_id', cook.id).order('menu_date', { ascending: true }),
      supabase.from('reviews').select('*').eq('cook_id', cook.id).order('created_at', { ascending: false }),
    ]);
    setMenus(menusRes.data || []);
    setReviews(reviewsRes.data || []);
    setLoading(false);
  }

  async function handleSubscribe(name: string, phone: string, address: string, plan: 'weekly' | 'monthly') {
    setSubmitting(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        cook_id: cook.id,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        plan_type: plan,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      setErrorMsg('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubscriptions([...subscriptions, data]);
    await supabase.from('cooks').update({ total_subscribers: cook.total_subscribers + 1 }).eq('id', cook.id);
    setSuccessMsg('Subscribed successfully! Your first tiffin arrives tomorrow.');
    setShowSubscribe(false);
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleSkip(subscriptionId: string, skipDate: string) {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const cutoff = new Date(tomorrow);
    cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);

    if (now > cutoff) {
      setErrorMsg('Skip cutoff has passed. You must skip before 9 PM the previous night.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('skips')
      .insert({
        subscription_id: subscriptionId,
        cook_id: cook.id,
        skip_date: skipDate,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        setErrorMsg('You have already skipped this date.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
      setSubmitting(false);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setSkips([...skips, data]);
    setSuccessMsg('Meal skipped for ' + skipDate);
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleReview(name: string, rating: number, text: string) {
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      cook_id: cook.id,
      customer_name: name,
      rating,
      review_text: text,
    });

    if (error) {
      setErrorMsg('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    const newCount = cook.total_reviews + 1;
    const newRating = ((cook.rating * cook.total_reviews) + rating) / newCount;
    await supabase.from('cooks').update({
      total_reviews: newCount,
      rating: Math.round(newRating * 10) / 10,
    }).eq('id', cook.id);

    await loadData();
    setShowReviewForm(false);
    setSuccessMsg('Review posted successfully!');
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleComplaint(name: string, subject: string, desc: string) {
    setSubmitting(true);
    const { error } = await supabase.from('complaints').insert({
      cook_id: cook.id,
      customer_name: name,
      subject,
      description: desc,
      status: 'open',
    });

    if (error) {
      setErrorMsg('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setShowComplaintForm(false);
    setSuccessMsg('Complaint submitted. Our admin team will review it shortly.');
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function isSkipped(subId: string, date: string) {
    return skips.some((s) => s.subscription_id === subId && s.skip_date === date);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to all cooks</span>
      </button>

      {(successMsg || errorMsg) && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
          successMsg ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {successMsg ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="text-sm font-medium">{successMsg || errorMsg}</span>
        </div>
      )}

      {/* Cook Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <div className="h-48 bg-gradient-to-br from-orange-200 via-amber-200 to-red-200 relative">
          <img
            src={cook.image_url || 'https://images.pexels.com/photos/39323513/pexels-photo-39323513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
            alt={cook.cuisine}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{cook.name}</h1>
                {cook.veg_only ? (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Pure Veg
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Drumstick className="w-3 h-3" /> Veg & Non-Veg
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {cook.area}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {cook.rating.toFixed(1)} ({cook.total_reviews})
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {cook.total_subscribers} subscribers
                </span>
              </div>
              <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">{cook.bio}</p>
              {cook.diet_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {cook.diet_tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <div className="text-xs text-gray-500 mb-1">Starting from</div>
                <div className="text-2xl font-bold text-orange-600">₹{cook.price_weekly}</div>
                <div className="text-xs text-gray-500">per week</div>
                <div className="text-sm text-gray-600 mt-2">or ₹{cook.price_monthly}/month</div>
              </div>
              <button
                onClick={() => setShowSubscribe(true)}
                className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-600" />
            Daily Menu
          </h2>
          {menus.length === 0 ? (
            <p className="text-sm text-gray-400">No menu posted yet.</p>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => {
                const date = new Date(menu.menu_date + 'T00:00:00');
                const isToday = menu.menu_date === new Date().toISOString().split('T')[0];
                return (
                  <div key={menu.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {isToday ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Available now
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {menu.items.map((item, i) => (
                        <span key={i} className="text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscriptions & Skip Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-orange-600" />
            My Subscription
          </h2>

          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-3">You don't have an active subscription yet.</p>
              <button
                onClick={() => setShowSubscribe(true)}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Subscribe to start receiving tiffins →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{sub.customer_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {sub.plan_type} plan • Started {new Date(sub.start_date).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Skip tomorrow's tiffin</div>
                        <div className="text-xs text-gray-400">Cutoff: 9 PM tonight</div>
                      </div>
                    </div>
                    {isSkipped(sub.id, tomorrowStr) ? (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                        Skipped
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSkip(sub.id, tomorrowStr)}
                        disabled={submitting}
                        className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Skip Meal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex-1 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl py-2.5 transition-colors"
            >
              Write Review
            </button>
            <button
              onClick={() => setShowComplaintForm(true)}
              className="flex-1 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl py-2.5 transition-colors"
            >
              Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-sm">{review.customer_name}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSubscribe && (
        <SubscribeModal
          cook={cook}
          onClose={() => setShowSubscribe(false)}
          onSubmit={handleSubscribe}
          submitting={submitting}
        />
      )}
      {showReviewForm && (
        <ReviewModal
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReview}
          submitting={submitting}
        />
      )}
      {showComplaintForm && (
        <ComplaintModal
          onClose={() => setShowComplaintForm(false)}
          onSubmit={handleComplaint}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function SubscribeModal({
  cook, onClose, onSubmit, submitting,
}: {
  cook: Cook;
  onClose: () => void;
  onSubmit: (name: string, phone: string, address: string, plan: 'weekly' | 'monthly') => void;
  submitting: boolean;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState<'weekly' | 'monthly'>('weekly');

  return (
    <Modal onClose={onClose} title={`Subscribe to ${cook.name}`}>
      <div className="space-y-4">
        <Input label="Your Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
        <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="10-digit mobile number" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address with area and pincode"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Plan</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlan('weekly')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                plan === 'weekly' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-900">Weekly</div>
              <div className="text-sm text-gray-500">₹{cook.price_weekly} / week</div>
            </button>
            <button
              onClick={() => setPlan('monthly')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                plan === 'monthly' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-900">Monthly</div>
              <div className="text-sm text-gray-500">₹{cook.price_monthly} / month</div>
              <div className="text-xs text-green-600 mt-1">Save ₹{cook.price_weekly * 4 - cook.price_monthly}</div>
            </button>
          </div>
        </div>
        <button
          onClick={() => onSubmit(name, phone, address, plan)}
          disabled={!name || !phone || !address || submitting}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? 'Subscribing...' : 'Confirm Subscription'}
        </button>
      </div>
    </Modal>
  );
}

function ReviewModal({
  onClose, onSubmit, submitting,
}: {
  onClose: () => void;
  onSubmit: (name: string, rating: number, text: string) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  return (
    <Modal onClose={onClose} title="Write a Review">
      <div className="space-y-4">
        <Input label="Your Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                <Star className={`w-8 h-8 ${n <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with this tiffin service..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={() => onSubmit(name, rating, text)}
          disabled={!name || !text || submitting}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </Modal>
  );
}

function ComplaintModal({
  onClose, onSubmit, submitting,
}: {
  onClose: () => void;
  onSubmit: (name: string, subject: string, desc: string) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <Modal onClose={onClose} title="Report an Issue">
      <div className="space-y-4">
        <Input label="Your Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
        <Input label="Subject" value={subject} onChange={setSubject} placeholder="Brief title of the issue" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={() => onSubmit(name, subject, desc)}
          disabled={!name || !subject || !desc || submitting}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
      />
    </div>
  );
}
