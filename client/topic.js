document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const addPartBtn = document.getElementById("add-part-btn");
  const partList = document.getElementById("part-list-items");
  const headerTitle = document.querySelector("header p");
  const mainTitle = document.getElementById("main-title");
  

  // URL에서 주제명 추출
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // 초기화 - 주제 목록 로드
  let topics = loadTopics();
  topics.forEach(createTopicElement);

  // 서브 파트 데이터 로드
  let subParts = loadSubParts(topic);
  subParts.forEach(createPartElement);

  // 주제명 표시
  if (topic) {
    headerTitle.textContent = topic;
  } else {
    headerTitle.textContent = "주제를 선택해주세요.";
  }

  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  
  /**
   * 주제 추가 버튼 클릭
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
   * 서브 파트 추가 버튼 클릭
   */
  addPartBtn.addEventListener("click", () => {
    if (!topic) {
      alert("주제를 먼저 선택해주세요.");
      return;
    }

    const newPart = prompt("추가할 서브 파트 이름을 입력하세요:");

    if (newPart && newPart.trim() !== "") {
      const trimmedPart = newPart.trim();

      if (subParts.includes(trimmedPart)) {
        alert("이미 존재하는 서브 파트입니다.");
        return;
      }

      subParts.push(trimmedPart);
      saveSubParts(topic, subParts);
      createPartElement(trimmedPart);
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

        // 주제 삭제 시 해당 서브 파트도 모두 삭제
        if (topic === a.textContent) {
          subParts = [];
          saveSubParts(topic, []);
          partList.innerHTML = "";
        }
      }
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    topicList.insertBefore(li, addTopicBtn);
  }

  /**
   * 서브 파트 항목 생성 함수
   * @param {string} part
   */
  function createPartElement(part) {
    const li = document.createElement("li");
    li.textContent = part;
    li.className = "part-item";

    // 클릭 시 part.html로 이동
    li.addEventListener("click", () => {
      window.location.href = `part.html?topic=${encodeURIComponent(topic)}&part=${encodeURIComponent(part)}`;
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const confirmDelete = confirm("정말 이 서브 파트를 삭제하시겠습니까?");
      if (confirmDelete) {
        partList.removeChild(li);
        subParts = subParts.filter(p => p !== part);
        saveSubParts(topic, subParts);
      }
    });

    li.appendChild(delBtn);
    partList.appendChild(li);
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
   * 서브 파트 저장 함수
   * @param {string} topic
   * @param {Array} parts
   */
  function saveSubParts(topic, parts) {
    const data = loadAllParts();
    data[topic] = parts;
    localStorage.setItem("subParts", JSON.stringify(data));
  }

  /**
   * 서브 파트 불러오기 함수
   * @param {string} topic
   * @returns {Array}
   */
  function loadSubParts(topic) {
    const data = loadAllParts();
    return data[topic] || [];
  }

  /**
   * 모든 서브 파트 데이터 불러오기
   * @returns {Object}
   */
  function loadAllParts() {
    const saved = localStorage.getItem("subParts");
    return saved ? JSON.parse(saved) : {};
  }
});
