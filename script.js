document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const partList = document.getElementById("part-list-items");
  const mainTitle = document.getElementById("main-title");

  // 클릭 시 메인 페이지로 이동
  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  // 로컬 스토리지에서 기존 주제 불러오기
  let topics = loadTopics();
  topics.forEach(topic => createTopicElement(topic));

  // 페이지 로드 시 모든 파트를 불러와서 렌더링
  renderAllParts();

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

  /**
   * 주제 항목 생성 함수
   * @param {string} topic
   */
  function createTopicElement(topic) {
    const li = document.createElement("li");

    // 링크
    const a = document.createElement("a");
    a.href = `topic.html?topic=${encodeURIComponent(topic)}`;
    a.textContent = topic;

    // 삭제 버튼
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";

    // 삭제 기능
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const confirmDelete = confirm("정말 이 주제를 삭제하시겠습니까?");
      if (confirmDelete) {
        topicList.removeChild(li);

        topics = topics.filter(t => t !== topic);
        saveTopics(topics);
      }
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    topicList.insertBefore(li, addTopicBtn);
  }

  /**
   * 모든 파트를 렌더링하는 함수
   */
  function renderAllParts() {
    const allParts = loadAllParts();
    partList.innerHTML = "";

    if (allParts.length === 0) {
      partList.innerHTML = "<li>추가된 파트가 없습니다.</li>";
      return;
    }

    allParts.forEach(({ topic, part }) => {
      createPartElement(topic, part);
    });
  }

  /**
   * 파트 항목 생성 함수
   * @param {string} topic
   * @param {string} part
   */
  function createPartElement(topic, part) {
    const li = document.createElement("li");
    li.textContent = `${topic} - ${part}`;
    li.className = "part-item";

    li.addEventListener("click", () => {
      window.location.href = `part.html?topic=${encodeURIComponent(topic)}&part=${encodeURIComponent(part)}`;
    });

    partList.appendChild(li);
  }

  /**
   * 모든 파트 데이터 불러오기
   * @returns {Array}
   */
  function loadAllParts() {
    const saved = localStorage.getItem("subParts");
    const data = saved ? JSON.parse(saved) : {};
    const parts = [];

    for (const topic in data) {
      data[topic].forEach(part => {
        parts.push({ topic, part });
      });
    }

    return parts;
  }
});

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
