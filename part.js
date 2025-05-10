document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const headerTitle = document.querySelector("header p");
  const contentArea = document.getElementById("content-area");
  const toolbar = document.getElementById("toolbar");

  // URL에서 주제명과 서브 파트명 추출
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  // 헤더에 "주제 > 파트" 형식으로 표시
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

  // 로컬 스토리지에서 기존 주제 불러오기
  let topics = loadTopics();
  topics.forEach(createTopicElement);

  // 주제 추가 버튼 클릭 이벤트
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

  // 텍스트 자동 저장 - 입력 시 저장
  contentArea.addEventListener("input", saveContentOnChange);
});

/**
 * 드래그 시 툴바 표시
 */
document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const toolbar = document.getElementById("toolbar");

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

/**
 * 텍스트 포맷팅 함수 (굵게, 기울임 등)
 * @param {string} command - 포맷 명령어
 */
window.formatText = function (command) {
  document.execCommand(command, false, null);
  saveContentOnChange();
};

/**
 * 스타일 적용 함수
 * @param {Object} styles - 스타일 객체 (e.g., { color: "#ff0000", fontSize: "16px" })
 */
function applyStyleToSelection(styles) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();
  if (!selectedText) return;

  const span = document.createElement("span");
  Object.assign(span.style, styles);
  span.textContent = selectedText;

  range.deleteContents();
  range.insertNode(span);

  saveContentOnChange();
}

/**
 * 글자 크기 조정
 * @param {number} sizeChange - 증감할 폰트 크기 (px)
 */
window.adjustFontSize = function (sizeChange) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;
  const parentNode = range.startContainer;

  const selectedText = selection.toString().trim();
  if (!selectedText) return;

  // 부모 노드의 현재 폰트 크기 계산
  let baseFontSize = 16; // 기본 폰트 크기 (16px)
  if (parentNode.parentElement && parentNode.parentElement.style.fontSize) {
    baseFontSize = parseFloat(parentNode.parentElement.style.fontSize);
  }

  const newFontSize = Math.max(10, baseFontSize + sizeChange); // 최소 폰트 크기 10px 제한

  // 새로운 `SPAN` 생성
  const span = document.createElement("span");
  span.style.fontSize = `${newFontSize}px`;
  span.textContent = selectedText;

  // 선택한 텍스트를 `SPAN`으로 교체
  range.deleteContents();
  range.insertNode(span);

  // 새로운 범위 설정 (드래그 영역 복원)
  const newRange = document.createRange();
  newRange.setStart(span.firstChild, 0);
  newRange.setEnd(span.firstChild, span.firstChild.length);
  
  selection.removeAllRanges();
  selection.addRange(newRange);

  saveContentOnChange(); // 변경 사항 저장
};

/**
 * 텍스트 색상 변경 함수
 * @param {string} color - 선택된 색상 값 (e.g., #ff0000)
 */
window.changeTextColor = function (color) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText) return;

  const range = selection.getRangeAt(0);

  // 새 span을 생성하여 스타일을 적용
  const span = document.createElement("span");
  span.style.color = color;
  span.textContent = selectedText;

  // 선택된 텍스트만 새 span으로 대체
  range.deleteContents();
  range.insertNode(span);

  saveContentOnChange(); // 변경 사항 저장
};

/**
 * Span의 텍스트 색상 적용 함수
 * @param {HTMLElement} span - 대상 span 요소
 * @param {string} color - 색상 값
 */
function applyColorToSpan(span, color) {
  span.style.color = color;
}

/**
 * 주제 항목 생성 함수
 * @param {string} topic
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
      localStorage.removeItem(`content_${topic}`);
    }
  });

  li.appendChild(a);
  li.appendChild(delBtn);
  topicList.insertBefore(li, addTopicBtn);
}

/**
 * 주제 저장 함수
 * @param {Array} topics
 */
function saveTopics(topics) {
  localStorage.setItem("studyTopics", JSON.stringify(topics));
}

/**
 * 주제 불러오기 함수
 * @returns {Array}
 */
function loadTopics() {
  const saved = localStorage.getItem("studyTopics");
  return saved ? JSON.parse(saved) : [];
}

/**
 * 주제별 내용 저장 함수
 * @param {string} topic
 * @param {string} content
 */
function saveContent(topic, content) {
  localStorage.setItem(`content_${topic}`, content);
}

/**
 * 주제별 내용 불러오기 함수
 * @param {string} topic
 * @returns {string}
 */
function loadContent(topic) {
  return localStorage.getItem(`content_${topic}`) || "";
}

/**
 * 변경이 발생할 때마다 저장
 */
function saveContentOnChange() {
  const contentArea = document.getElementById("content-area");
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  if (topic && part) {
    saveContent(`${topic}_${part}`, contentArea.innerHTML);
  } else if (topic) {
    saveContent(topic, contentArea.innerHTML);
  }
}
