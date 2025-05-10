document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const headerTitle = document.querySelector("header p");
  const contentArea = document.getElementById("content-area");

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

      // 중복 체크
      if (topics.includes(trimmedTopic)) {
        alert("이미 존재하는 주제입니다.");
        return;
      }

      topics.push(trimmedTopic);
      saveTopics(topics);
      createTopicElement(trimmedTopic);
    }
  });

  // 텍스트 자동 저장
  contentArea.addEventListener("input", () => {
    if (topic && part) {
      saveContent(`${topic}_${part}`, contentArea.innerHTML);
    } else if (topic) {
      saveContent(topic, contentArea.innerHTML);
    }
  });

  /**
   * 주제 항목 생성 함수
   * @param {string} topic
   */
  function createTopicElement(topic) {
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
        topics = topics.filter(t => t !== topic);
        saveTopics(topics);
        localStorage.removeItem(`content_${topic}`);

        if (topic === headerTitle.textContent) {
          headerTitle.textContent = "주제를 선택해주세요.";
          contentArea.innerHTML = "";
        }
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
});
