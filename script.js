document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");

  // 로컬 스토리지에서 기존 주제 불러오기
  let topics = loadTopics();
  topics.forEach(topic => createTopicElement(topic));

  // 주제 추가 버튼 클릭 이벤트
  addTopicBtn.addEventListener("click", () => {
    const newTopic = prompt("추가할 주제 이름을 입력하세요:");

    if (newTopic && newTopic.trim() !== "") {
      topics.push(newTopic); // 배열에 추가
      saveTopics(topics);    // 저장

      createTopicElement(newTopic); // 화면에 추가
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
    a.href = "#";
    a.textContent = topic;

    // 삭제 버튼
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";

    // 삭제 기능
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 링크 클릭 방지

      const confirmDelete = confirm("정말 이 주제를 삭제하시겠습니까?");
      if (confirmDelete) {
        // 화면에서 삭제
        topicList.removeChild(li);

        // 배열에서 삭제
        topics = topics.filter(t => t !== topic);
        saveTopics(topics); // 저장소 업데이트
      }
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    topicList.insertBefore(li, addTopicBtn);
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
