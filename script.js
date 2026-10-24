import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { Bytes, collection, doc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTJ2fTMhlw631McmQC-wq2tYL9SnQ4Xqg",
  authDomain: "dawoofarm-yp-loi-site.firebaseapp.com",
  projectId: "dawoofarm-yp-loi-site",
  storageBucket: "dawoofarm-yp-loi-site.firebasestorage.app",
  messagingSenderId: "1036064144024",
  appId: "1:1036064144024:web:fecdfa29322aa2a7d6aeed",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const app = document.querySelector("#app");
const siteHeader = document.querySelector("#siteHeader");
const toast = document.querySelector("#toast");

const state = {
  view: "home",
  step: 1,
  submitting: false,
  receiptNo: "",
  form: {
    name: "",
    age: "",
    credit: "",
    intentAgree: false,
    privacyAgree: false,
    uniqueAgree: false,
    serviceAgree: false,
    carrier: "SKT",
    phone: "",
    authCode: "",
    codeSent: false,
    verified: false,
    idFile: null,
    creditFile: null,
    finalAgree: false,
  },
};

const steps = {
  1: {
    label: "STEP 01",
    title: "기본정보 입력",
    description: "정확한 정보 입력이 필요합니다.",
  },
  2: {
    label: "STEP 02",
    title: "다우팜 양평 조합원 가입 의향서",
    description: "아래 내용을 확인하고 동의해 주세요.",
  },
  3: {
    label: "STEP 03",
    title: "개인정보 동의 및 본인인증",
    description: "필수 항목에 동의하고 휴대전화 인증을 진행해 주세요.",
  },
  4: {
    label: "STEP 04",
    title: "필수 서류 제출",
    description: "아래 서류를 업로드해 주세요. 모든 서류는 필수 제출 항목입니다.",
  },
};

function cloneTemplate(id) {
  return document.querySelector(id).content.cloneNode(true);
}

function setView(view) {
  state.view = view;
  window.scrollTo({ top: 0, behavior: "auto" });
  render();
}

function render() {
  app.replaceChildren();
  siteHeader.classList.toggle("hidden", state.view !== "home");

  if (state.view === "home") app.append(cloneTemplate("#homeTemplate"));
  if (state.view === "info") app.append(cloneTemplate("#infoTemplate"));
  if (state.view === "form") {
    app.append(cloneTemplate("#formTemplate"));
    renderFormStage();
    document.querySelector("#applicationForm").addEventListener("submit", handleSubmit);
  }
  if (state.view === "complete") app.append(cloneTemplate("#completeTemplate"));
  if (state.view === "complete" && state.receiptNo) {
    document.querySelector("#receiptMessage").innerHTML = `접수번호 <strong>${escapeHtml(state.receiptNo)}</strong><br />담당자 검토 후 연락드리겠습니다.`;
  }
}

function renderFormStage() {
  const stage = document.querySelector("#formStage");
  const progress = document.querySelector("#progressFill");
  const prev = document.querySelector("#prevButton");
  const next = document.querySelector("#nextButton");
  const info = steps[state.step];

  document.querySelectorAll(".progress-steps li").forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("active", itemStep === state.step);
    item.classList.toggle("done", itemStep < state.step);
  });
  progress.style.width = `${((state.step - 1) / 3) * 100}%`;
  prev.hidden = state.step === 1;
  document.querySelector(".form-actions").classList.toggle("single", state.step === 1);
  next.innerHTML = state.step === 4 ? "제출하기 <span>→</span>" : "다음 단계로 <span>→</span>";

  const heading = `
    <div class="step-heading">
      <span class="step-number">${info.label}</span>
      <h1>${info.title}</h1>
      <p>${info.description}</p>
    </div>`;

  stage.innerHTML = heading + stepMarkup(state.step);
  hydrateStepEvents();
}

function stepMarkup(step) {
  if (step === 1) {
    return `
      <label class="field">
        <span>이름 <b class="required">(필수)</b></span>
        <input name="name" type="text" autocomplete="name" maxlength="20" placeholder="이름을 입력해 주세요" value="${escapeHtml(state.form.name)}" />
      </label>
      <label class="field">
        <span>나이대 <b class="required">(필수)</b></span>
        <select name="age">
          <option value="">선택해 주세요</option>
          ${["30대 이하", "40대", "50대", "60대", "70대 이상"].map((value) => `<option value="${value}" ${state.form.age === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <fieldset class="fieldset">
        <legend>NICE 신용점수 <b class="required">(필수)</b></legend>
        <span class="helper">어느 항목에 해당하십니까?</span>
        <div class="radio-stack" style="margin-top:14px">
          <label class="choice"><input name="credit" type="radio" value="850+" ${state.form.credit === "850+" ? "checked" : ""} /> 850점 이상</label>
          <label class="choice"><input name="credit" type="radio" value="850-" ${state.form.credit === "850-" ? "checked" : ""} /> 850점 미만</label>
        </div>
      </fieldset>
      <p class="field-error" id="stepError">필수 정보를 모두 입력해 주세요.</p>`;
  }

  if (step === 2) {
    return `
      <article class="terms-card">
        <header><strong>다우팜 양평 조합원 가입 의향서 (요약)</strong></header>
        <div class="terms-scroll" tabindex="0">
          <p>본인은 다우팜 양평이 추진하는 LG 스마트팜 빌리지 조성사업의 취지와 주요 내용을 충분히 이해하였으며, 조합원으로서의 가입 의향이 있음을 확인합니다.</p>
          <h3>1. 의향서의 성격</h3>
          <p>본 의향서는 조합원 모집을 위한 사전 의사 확인 단계이며, 향후 정식 계약과는 별개의 절차임을 이해합니다.</p>
          <h3>2. 사업 개요</h3>
          <p>양평군 가현리 일원에 14평 LG 스마트 단독주택 60동과 35평 대왕버섯 재배실 60실, 공동 생산시설 등을 조성하는 사업계획입니다.</p>
          <h3>3. 참여 조건 확인</h3>
          <p>세대당 참여금 등 구체적인 조건은 모집 및 계약 단계에서 제공되는 공식 자료를 기준으로 하며, 사업계획은 인허가와 사업 진행 상황에 따라 변경될 수 있습니다.</p>
          <h3>4. 안내 사항</h3>
          <p>신청인은 추후 제공되는 모집 안내와 계약 문서를 별도로 검토한 뒤 최종 참여 여부를 결정합니다.</p>
        </div>
      </article>
      <label class="check-line">
        <input name="intentAgree" type="checkbox" ${state.form.intentAgree ? "checked" : ""} />
        <span>위 내용을 확인하였으며 조합원 가입 의향서 작성에 동의합니다.</span>
      </label>
      <p class="field-error" id="stepError">의향서 내용을 확인하고 동의해 주세요.</p>`;
  }

  if (step === 3) {
    return `
      <div class="agreement-list">
        ${agreement("privacyAgree", "(필수) 개인정보 수집·이용 동의")}
        ${agreement("uniqueAgree", "(필수) 고유식별정보 처리 동의")}
        ${agreement("serviceAgree", "(필수) 서비스 이용약관 동의")}
      </div>
      <div class="divider"></div>
      <div class="step-heading" style="margin-bottom:18px">
        <h1 style="font-size:18px">휴대전화 본인인증</h1>
        <p>본인 확인을 위해 휴대전화 인증이 필요합니다.</p>
      </div>
      <fieldset class="fieldset">
        <legend>통신사 선택</legend>
        <div class="carrier-row">
          ${["SKT", "KT", "LG U+", "알뜰폰"].map((carrier) => `<label class="choice"><input name="carrier" type="radio" value="${carrier}" ${state.form.carrier === carrier ? "checked" : ""} />${carrier}</label>`).join("")}
        </div>
        <div class="phone-row">
          <input name="phone" inputmode="numeric" autocomplete="tel" maxlength="13" placeholder="010-0000-0000" value="${escapeHtml(state.form.phone)}" />
          <button type="button" data-action="send-code">인증번호 받기</button>
        </div>
      </fieldset>
      ${state.form.codeSent ? `
        <div class="verify-row">
          <input name="authCode" inputmode="numeric" maxlength="6" placeholder="인증번호 6자리" value="${escapeHtml(state.form.authCode)}" ${state.form.verified ? "disabled" : ""} />
          <button type="button" data-action="verify" ${state.form.verified ? "disabled" : ""}>인증 확인</button>
        </div>
        <span class="helper">로컬 데모 인증번호는 <strong>123456</strong>입니다.</span>
      ` : ""}
      ${state.form.verified ? '<div class="verified-banner">본인인증이 완료되었습니다.</div>' : ""}
      <p class="field-error" id="stepError">필수 동의와 휴대전화 인증을 완료해 주세요.</p>`;
  }

  return `
    ${uploadCard("idFile", "주민등록증 사진", "JPG, PNG · 10MB 이하")}
    ${uploadCard("creditFile", "NICE 신용정보 점수 확인서", "JPG, PNG, PDF · 10MB 이하")}
    <label class="check-line" style="margin-top:20px">
      <input name="finalAgree" type="checkbox" ${state.form.finalAgree ? "checked" : ""} />
      <span>제출 서류와 입력 내용이 사실과 다르지 않음을 확인합니다.</span>
    </label>
    <p class="field-error" id="stepError">필수 서류 2건을 업로드하고 확인 항목에 동의해 주세요.</p>
    <p class="demo-note">제출하신 정보와 서류는 다우팜 양평 조합원 모집 검토 목적으로 안전하게 저장되며, 승인된 관리자만 확인할 수 있습니다.</p>`;
}

function agreement(name, label) {
  return `<label class="check-line"><input name="${name}" type="checkbox" ${state.form[name] ? "checked" : ""} /><span>${label}</span><button type="button" data-action="show-term">자세히 보기</button></label>`;
}

function uploadCard(name, title, formats) {
  const file = state.form[name];
  const imagePreview = file && file.type.startsWith("image/") ? `<img src="${URL.createObjectURL(file)}" alt="${title} 미리보기" />` : file ? `<span>✓<br />${escapeHtml(file.name)}</span>` : `<span>신분증 번호 등 민감정보가<br />노출되지 않도록 확인해 주세요.</span>`;
  return `
    <article class="upload-card">
      <header><strong>${title}</strong><span>필수</span></header>
      <div class="upload-preview">${imagePreview}</div>
      <label>▣ 파일 선택<input name="${name}" type="file" accept="${name === "creditFile" ? "image/png,image/jpeg,application/pdf" : "image/png,image/jpeg"}" /></label>
      <span class="file-name">${file ? escapeHtml(file.name) : formats}</span>
      <ul class="upload-notes"><li>파일 1개당 최대 10MB까지 가능합니다.</li><li>화면에서 글자와 사진을 확인할 수 있어야 합니다.</li></ul>
    </article>`;
}

function hydrateStepEvents() {
  const form = document.querySelector("#applicationForm");
  form.querySelectorAll("input, select").forEach((element) => {
    const eventName = element.type === "text" || element.type === "tel" || element.inputMode === "numeric" ? "input" : "change";
    element.addEventListener(eventName, (event) => updateField(event.target));
  });
}

function updateField(element) {
  const { name } = element;
  if (!name) return;
  if (element.type === "file") {
    const file = element.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      element.value = "";
      showToast("10MB 이하의 파일을 선택해 주세요.");
      return;
    }
    state.form[name] = file || null;
    renderFormStage();
    return;
  }
  if (element.type === "checkbox") state.form[name] = element.checked;
  else if (name === "phone") state.form[name] = formatPhone(element.value);
  else state.form[name] = element.value;
  if (name === "phone" || name === "carrier") state.form.verified = false;
  if (name === "phone") element.value = state.form[name];
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!validateStep()) return;
  if (state.step < 4) {
    state.step += 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderFormStage();
    return;
  }
  if (state.submitting) return;
  const submitButton = document.querySelector("#nextButton");
  state.submitting = true;
  submitButton.disabled = true;
  submitButton.innerHTML = "안전하게 제출 중…";
  try {
    state.receiptNo = await submitApplication();
    setView("complete");
  } catch (error) {
    console.error(error);
    showToast("제출하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.");
    submitButton.disabled = false;
    submitButton.innerHTML = "제출하기 <span>→</span>";
  } finally {
    state.submitting = false;
  }
}

async function submitApplication() {
  const applicationRef = doc(collectionRef());
  const receiptNo = createReceiptNo(applicationRef.id);
  const [idFile, creditFile] = await Promise.all([
    uploadApplicationFile(applicationRef.id, "id", state.form.idFile),
    uploadApplicationFile(applicationRef.id, "credit", state.form.creditFile),
  ]);
  await setDoc(applicationRef, {
    receiptNo,
    name: state.form.name.trim(),
    ageGroup: state.form.age,
    creditBand: state.form.credit,
    carrier: state.form.carrier,
    phone: state.form.phone,
    verified: state.form.verified,
    consents: {
      intent: state.form.intentAgree,
      privacy: state.form.privacyAgree,
      unique: state.form.uniqueAgree,
      service: state.form.serviceAgree,
      final: state.form.finalAgree,
    },
    files: { idFile, creditFile },
    status: "pending",
    note: "",
    source: "public-loi-site",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return receiptNo;
}

function collectionRef() {
  return collection(db, "applications");
}

async function uploadApplicationFile(applicationId, kind, file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 600 * 1024;
  const chunks = Math.ceil(bytes.length / chunkSize);
  const writes = [];
  for (let index = 0; index < chunks; index += 1) {
    const part = bytes.slice(index * chunkSize, Math.min((index + 1) * chunkSize, bytes.length));
    writes.push(setDoc(doc(db, "applications", applicationId, "files", `${kind}-${String(index).padStart(3, "0")}`), {
      kind,
      index,
      bytes: Bytes.fromUint8Array(part),
    }));
  }
  await Promise.all(writes);
  return { name: file.name, kind, type: file.type, size: file.size, chunks, storage: "firestore" };
}

function createReceiptNo(id) {
  const date = new Date();
  const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("");
  return `DW-${datePart}-${id.slice(0, 5).toUpperCase()}`;
}

function validateStep() {
  const f = state.form;
  let valid = false;
  if (state.step === 1) valid = f.name.trim().length >= 2 && f.age && f.credit;
  if (state.step === 2) valid = f.intentAgree;
  if (state.step === 3) valid = f.privacyAgree && f.uniqueAgree && f.serviceAgree && f.verified;
  if (state.step === 4) valid = f.idFile && f.creditFile && f.finalAgree;
  document.querySelector("#stepError")?.classList.toggle("show", !valid);
  if (!valid) showToast("필수 항목을 확인해 주세요.");
  return Boolean(valid);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;

  if (action === "home") {
    event.preventDefault();
    setView("home");
  }
  if (action === "info") setView("info");
  if (action === "start") {
    state.step = 1;
    setView("form");
  }
  if (action === "prev" || action === "form-back") {
    if (state.step > 1) {
      state.step -= 1;
      renderFormStage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setView("home");
  }
  if (action === "send-code") {
    if (!/^010-\d{4}-\d{4}$/.test(state.form.phone)) {
      showToast("휴대전화 번호를 정확히 입력해 주세요.");
      return;
    }
    state.form.codeSent = true;
    state.form.verified = false;
    renderFormStage();
    showToast("데모 인증번호 123456을 입력해 주세요.");
  }
  if (action === "verify") {
    if (state.form.authCode === "123456") {
      state.form.verified = true;
      renderFormStage();
      showToast("본인인증이 완료되었습니다.");
    } else showToast("인증번호를 다시 확인해 주세요.");
  }
  if (action === "show-term") showToast("현재 화면은 가입 의향 확인용 데모 약관입니다.");
});

const previewParams = new URLSearchParams(window.location.search);
if (previewParams.get("view") === "form") {
  state.view = "form";
  const requestedStep = Number(previewParams.get("step"));
  if (requestedStep >= 1 && requestedStep <= 4) state.step = requestedStep;
}
if (previewParams.get("view") === "info") state.view = "info";

render();
