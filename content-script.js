const insertScript = (pathOrCode, isPath = true) => {
  let newScript = window.document.createElement('script');
  if (isPath) newScript.src = chrome.extension.getURL(pathOrCode);
  if (!isPath) newScript.innerText = pathOrCode;
  newScript.onload = function () {
    window.document.body.removeChild(newScript);
  };
  let doc = window.document.body || window.document.head || window.document.documentElement;
  doc.appendChild(newScript);
}

insertScript('./interceptor.js');

(() => {
  const downloadIconUrl = chrome.extension.getURL("img/download.png");
  let interval = setInterval(() => {
    const controlsContainer = document.querySelector('.miomc0xe.pmk7jnqg.cgat1ltu.n7fi1qx3.j83agx80');
    if (!controlsContainer) return;
    if (controlsContainer.querySelector('.injected-controls')) return;
    const button = document.createElement('div');
    button.className = 'tojvnm2t a6sixzi8 k5wvi7nf q3lfd5jv pk4s997a bipmatt0 cebpdrjk qowsmv63 owwhemhu dp1hu0rb dhp61c6y l9j0dhe7 iyyx5f41 a8s20v7p injected-controls';
    button.innerHTML = `<div aria-label='Download' class='oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl n00je7tq arfg74bv qs9ysxi8 k77z8yql l9j0dhe7 abiwlrkh p8dawk7l' role='button' tabindex='0'>
      <div class='h676nmdw oygrvhab oi9244e8 kvgmc6g5 nhd2j8a9'>
        <i data-visualcompletion='css-img' class='hu5pjgll eb18blue' style="background-image: url('${downloadIconUrl}'); background-size: auto; width: 24px; height: 24px; background-repeat: no-repeat; display: inline-block;"></i>
      </div>        
    </div>`;
    button.onclick = () => {
      const e = new CustomEvent('request-download-story', {});
      window.dispatchEvent(e);
    };
    controlsContainer.prepend(button);
  }, 100);
})()
