const menuToggle=document.getElementById("menuToggle");
const navMenu=document.getElementById("navMenu");

menuToggle.addEventListener("click",()=>{
  const open=navMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",open);
});

document.querySelectorAll("#navMenu a").forEach(link=>{
  link.addEventListener("click",()=>{
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
  });
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});

document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

document.getElementById("registerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=e.target.elements.name.value.trim();
  document.getElementById("formMessage").textContent=
    `The gates are open, ${name}. Your demo registration was received!`;
  e.target.reset();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
  }
});
