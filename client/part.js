document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const headerTitle = document.querySelector("header p");
  const contentArea = document.getElementById("content-area");
  const toolbar = document.getElementById("toolbar");
  const imageUploadBtn = document.getElementById("image-upload-btn");
  const imageUploadInput = document.getElementById("image-upload-input");
  const mainTitle = document.getElementById("main-title");
  
  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });


  /**
   * ✅ 이미지 업로드 버튼 클릭 이벤트
   */
  if (imageUploadBtn && imageUploadInput) {
    imageUploadBtn.addEventListener("click", () => {
      console.log("이미지 업로드 버튼 클릭됨");
      imageUploadInput.click();
    });

    imageUploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (!file) {
        console.warn("파일이 선택되지 않았습니다.");
        return;
      }

      console.log("파일 선택됨:", file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const uploadedImage = e.target.result;
          console.log("이미지 데이터:", uploadedImage);
          
          // ✅ 함수명 수정: insertImageInContent()
          insertImageInContent(uploadedImage);
        };
        reader.readAsDataURL(file);
      } else {
        console.error("이미지 파일이 아님:", file.type);
        alert("이미지 파일만 업로드 가능합니다.");
        imageUploadInput.value = "";
      }
    });
  }

  /**
   * ✅ URL에서 주제명과 서브 파트명 추출
   */
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  if (topic && part) {
    headerTitle.textContent = `${topic} > ${part}`;
    contentArea.innerHTML = loadContent(`${topic}_${part}`);
  } else if (topic) {
    headerTitle.textContent = topic;
    contentArea.innerHTML = loadContent(topic);
  } else {
    headerTitle.textContent = "주제를 선택해주세요.";
    contentArea.innerHTML = "";
  }

  /**
   * ✅ 로컬 스토리지에서 기존 주제 불러오기
   */
  let topics = loadTopics();
  topics.forEach(createTopicElement);

  /**
   * ✅ 주제 추가 버튼 클릭 이벤트
   */
  addTopicBtn.addEventListener("click", () => {
    const newTopic = prompt("추가할 주제 이름을 입력하세요:");
    if (newTopic && newTopic.trim() !== "") {
      const trimmedTopic = newTopic.trim();
      if (topics.includes(trimmedTopic)) {
        alert("이미 존재하는 주제입니다.");
        return;
      }
      topics.push(trimmedTopic);
      saveTopics(topics);
      createTopicElement(trimmedTopic);
    }
  });

  /**
   * ✅ 텍스트 자동 저장 - 입력 시 저장
   */
  contentArea.addEventListener("input", saveContentOnChange);

  /**
   * ✅ 드래그 시 툴바 표시
   */
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
 * ✅ 본문(contentArea)에 이미지 삽입 함수
 * @param {string} imageSrc - 이미지 소스 경로
 */
function insertImageInContent(imageSrc) {
  const contentArea = document.getElementById("content-area");

  const wrapper = document.createElement("div");
  wrapper.classList.add("image-wrapper");

  const img = document.createElement("img");
  img.src = imageSrc;
  img.classList.add("resizable-image");
  img.style.width = "150px";  // 기본 크기
  img.style.height = "auto";
  img.style.cursor = "pointer";

  const resizer = document.createElement("div");
  resizer.classList.add("resizer");

  wrapper.appendChild(img);
  wrapper.appendChild(resizer);
  contentArea.appendChild(wrapper);

  enableResize(wrapper, img, resizer);
}
/**
 * ✅ 이미지 크기 조정 기능 활성화 함수
 */
function enableResize(wrapper, img, resizer) {
  let isResizing = false;

  resizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.body.style.cursor = "nwse-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const rect = wrapper.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newHeight = e.clientY - rect.top;

      img.style.width = `${newWidth}px`;
      img.style.height = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.style.cursor = "default";
  });
}

/**
   * ✅ 클릭 시 다른 이미지 핸들러 숨기기
   */
document.addEventListener("click", (e) => {
  const allWrappers = document.querySelectorAll(".image-wrapper");
  allWrappers.forEach(wrapper => {
    const resizer = wrapper.querySelector(".resizer");
    if (resizer) {
      resizer.style.display = "none";
    }
  });

  // 현재 클릭한 이미지에만 핸들러 표시
  if (e.target.classList.contains("resizable-image")) {
    const wrapper = e.target.parentElement;
    const resizer = wrapper.querySelector(".resizer");
    if (resizer) {
      resizer.style.display = "block";
    }
  }
});


/**
 * ✅ 텍스트 포맷팅 함수
 */
window.formatText = function (command) {
  document.execCommand(command, false, null);
  saveContentOnChange();
};
/**
 * ✅ 스타일 적용 함수
 * @param {Object} styles - 적용할 스타일 객체 (e.g., { color: 'red', fontSize: '20px' })
 */
function applyStyleToSelection(styles) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString();
  if (!selectedText) return;

  let span;

  const parentNode = range.startContainer.parentNode;

  // 이미 <span>이면 해당 <span> 업데이트
  if (parentNode.nodeName === "SPAN") {
    span = parentNode;
  } else {
    // 새로 <span> 생성
    span = document.createElement("span");
    span.textContent = selectedText;
    range.deleteContents();
    range.insertNode(span);
  }

  // 스타일 적용
  Object.keys(styles).forEach((key) => {
    span.style[key] = styles[key];
  });
}

/**
 * ✅ 글자 크기 조정 함수
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

  let newSize = currentSize + sizeChange;
  newSize = Math.max(8, Math.min(newSize, 48)); // 최소 8px, 최대 48px

  applyStyleToSelection({ fontSize: `${newSize}px` });
};

/**
 * ✅ 텍스트 색상 변경 함수
 */
window.changeTextColor = function (color) {
  applyStyleToSelection({ color: color });
};


/**
 * ✅ 주제 항목 생성 함수
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

  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const confirmDelete = confirm("정말 이 주제를 삭제하시겠습니까?");
    if (confirmDelete) {
      topicList.removeChild(li);
      let topics = loadTopics();
      topics = topics.filter(t => t !== topic);
      saveTopics(topics);
    }
  });

  li.appendChild(a);
  li.appendChild(delBtn);
  topicList.insertBefore(li, addTopicBtn);
}

/**
 * ✅ 주제 저장 함수
 */
function saveTopics(topics) {
  localStorage.setItem("studyTopics", JSON.stringify(topics));
}

/**
 * ✅ 주제 불러오기 함수
 */
function loadTopics() {
  const saved = localStorage.getItem("studyTopics");
  return saved ? JSON.parse(saved) : [];
}

/**
 * ✅ 주제별 내용 저장 함수
 */
function saveContent(topic, content) {
  localStorage.setItem(`content_${topic}`, content);
}

/**
 * ✅ 주제별 내용 불러오기 함수
 */
function loadContent(topic) {
  return localStorage.getItem(`content_${topic}`) || "";
}

/**
 * ✅ 변경이 발생할 때마다 저장
 */
function saveContentOnChange() {
  const contentArea = document.getElementById("content-area");
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  const key = topic && part ? `${topic}_${part}` : topic;
  if (key) {
    saveContent(key, contentArea.innerHTML);
  }
}


