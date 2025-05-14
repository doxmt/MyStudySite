import { API_BASE } from './utils/api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const headerTitle = document.querySelector("header p");
  const contentArea = document.getElementById("content-area");
  const toolbar = document.getElementById("toolbar");
  const imageUploadBtn = document.getElementById("image-upload-btn");
  const imageUploadInput = document.getElementById("image-upload-input");
  const mainTitle = document.getElementById("main-title");

  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  if (topic && part) {
    headerTitle.textContent = `${topic} > ${part}`;
    await loadContentFromServer(topic, part);
  } else if (topic) {
    headerTitle.textContent = topic;
    await loadContentFromServer(topic, null);
  } else {
    headerTitle.textContent = "주제를 선택해주세요.";
    contentArea.innerHTML = "";
  }

  // ✅ 서버에서 주제 목록 불러오기
  const topics = await loadTopicsFromServer();
  topics.forEach(createTopicElement);

  // ✅ 주제 추가 버튼
  addTopicBtn.addEventListener("click", async () => {
    const newTopic = prompt("추가할 주제 이름을 입력하세요:");
    if (!newTopic || !newTopic.trim()) return;

    const trimmed = newTopic.trim();
    if (topics.includes(trimmed)) {
      alert("이미 존재하는 주제입니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });
      if (!res.ok) throw new Error("추가 실패");

      topics.push(trimmed);
      createTopicElement(trimmed);
    } catch (err) {
      console.error("❌ 주제 추가 실패:", err);
    }
  });

  // ✅ 자동 저장
  contentArea.addEventListener("input", () => {
    if (topic) {
      saveContentToServer(topic, part, contentArea.innerHTML);
    }
  });

  // ✅ 이미지 업로드
  if (imageUploadBtn && imageUploadInput) {
    imageUploadBtn.addEventListener("click", () => imageUploadInput.click());

    imageUploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        insertImageInContent(imageData);
      };
      reader.readAsDataURL(file);
    });
  }

  // ✅ 드래그 시 툴바 표시
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      toolbar.style.top = `${rect.top + window.scrollY - 40}px`;
      toolbar.style.left = `${rect.left + window.scrollX}px`;
      toolbar.classList.remove("hidden");
    } else {
      toolbar.classList.add("hidden");
    }
  });
});

/**
 * ✅ 서버에서 주제 목록 불러오기
 */
async function loadTopicsFromServer() {
  try {
    const res = await fetch(`${API_BASE}/api/topics`);
    const data = await res.json();
    return data.map(t => t.name);
  } catch (err) {
    console.error("❌ 주제 목록 불러오기 실패:", err);
    return [];
  }
}

/**
 * ✅ 서버에서 내용 불러오기
 */
async function loadContentFromServer(topic, part) {
  const contentArea = document.getElementById("content-area");

  try {
    const url = `${API_BASE}/api/contents/${encodeURIComponent(topic)}${part ? `?part=${encodeURIComponent(part)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("불러오기 실패");

    const data = await res.json();
    contentArea.innerHTML = data.content || "";
  } catch (err) {
    console.error("❌ 내용 불러오기 실패:", err);
    contentArea.innerHTML = "";
  }
}

/**
 * ✅ 서버에 내용 저장
 */
async function saveContentToServer(topic, part, content) {
  console.log("📝 저장 요청", { topic, part, content }); // ← 이 줄 추가!

  try {
    const res = await fetch(`${API_BASE}/api/contents/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ part, content })
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error("저장 실패: " + error);
    }
  } catch (err) {
    console.error("❌ 내용 저장 실패:", err);
  }
}


/**
 * ✅ 주제 항목 생성
 */
function createTopicElement(topic) {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = `topic.html?topic=${encodeURIComponent(topic)}`;
  a.textContent = topic;

  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete-btn";

  delBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const confirmDelete = confirm("정말 이 주제를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/topics?name=${encodeURIComponent(topic)}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("삭제 실패");

      topicList.removeChild(li);
    } catch (err) {
      console.error("❌ 주제 삭제 실패:", err);
    }
  });

  li.appendChild(a);
  li.appendChild(delBtn);
  topicList.insertBefore(li, addTopicBtn);
}

/**
 * ✅ 본문에 이미지 삽입
 */
function insertImageInContent(imageSrc) {
  const contentArea = document.getElementById("content-area");

  const wrapper = document.createElement("div");
  wrapper.classList.add("image-wrapper");

  const img = document.createElement("img");
  img.src = imageSrc;
  img.classList.add("resizable-image");
  img.style.width = "150px";
  img.style.height = "auto";

  const resizer = document.createElement("div");
  resizer.classList.add("resizer");

  wrapper.appendChild(img);
  wrapper.appendChild(resizer);
  contentArea.appendChild(wrapper);

  enableResize(wrapper, img, resizer);
}

/**
 * ✅ 이미지 리사이즈 핸들러
 */
function enableResize(wrapper, img, resizer) {
  let isResizing = false;

  resizer.addEventListener("mousedown", (e) => {
    console.log("👆 mousedown"); 
    isResizing = true;
    document.body.style.cursor = "nwse-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    console.log("👆 mousemove"); 
    if (!isResizing) return;

    const rect = wrapper.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;

    // ✅ 최소/최대 제한
    const minWidth = 50;
    const maxWidth = 800;
    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

    img.style.width = `${clampedWidth}px`;

    // ❗ 강제로 스타일 적용되도록 확인 로그
    console.log("📏 이미지 너비 설정:", clampedWidth + "px");
  });

  document.addEventListener("mouseup", () => {
    console.log("👆 mouseup"); 
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
    }
  });
}


/**
 * ✅ 텍스트 포맷팅
 */
window.formatText = function (command) {
  document.execCommand(command, false, null);
};

/**
 * ✅ 글자 색상 변경
 */
window.changeTextColor = function (color) {
  applyStyleToSelection({ color });
};

/**
 * ✅ 글자 크기 조정
 */
window.adjustFontSize = function (sizeChange) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const parentNode = range.startContainer.parentNode;

  let currentSize = 16;
  if (parentNode.nodeName === "SPAN" && parentNode.style.fontSize) {
    currentSize = parseInt(parentNode.style.fontSize.replace("px", ""));
  }

  const newSize = Math.max(8, Math.min(currentSize + sizeChange, 48));
  applyStyleToSelection({ fontSize: `${newSize}px` });
};

/**
 * ✅ 선택 영역에 스타일 적용
 */
function applyStyleToSelection(styles) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString();
  if (!selectedText) return;

  let span;
  const parentNode = range.startContainer.parentNode;

  if (parentNode.nodeName === "SPAN") {
    span = parentNode;
  } else {
    span = document.createElement("span");
    span.textContent = selectedText;
    range.deleteContents();
    range.insertNode(span);
  }

  Object.keys(styles).forEach((key) => {
    span.style[key] = styles[key];
  });
}
// ✅ 이미지 클릭 시 리사이즈 핸들러 표시
document.addEventListener("click", (e) => {
  // 기존 active 제거
  document.querySelectorAll(".image-wrapper").forEach(wrapper => {
    wrapper.classList.remove("active");
  });

  // 클릭한 요소가 이미지라면 해당 wrapper에 active 클래스 추가
  if (e.target.classList.contains("resizable-image")) {
    const wrapper = e.target.closest(".image-wrapper");
    if (wrapper) {
      wrapper.classList.add("active");
    }
  }
});

