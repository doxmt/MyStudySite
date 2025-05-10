document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const headerTitle = document.querySelector("header p");

  // URL에서 주제명과 서브 파트명 추출
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const part = urlParams.get("part");

  // 헤더에 "주제 > 파트" 형식으로 표시
  if (topic && part) {
    headerTitle.textContent = `${topic} > ${part}`;
  } else {
    headerTitle.textContent = "주제를 선택해주세요.";
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

      topics.push(trimmedTopic); // 배열에 추가
      saveTopics(topics);    // 저장

      createTopicElement(trimmedTopic); // 화면에 추가
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
    a.href = `topic.html?topic=${encodeURIComponent(topic)}`; // 링크 생성
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

        // 현재 페이지가 삭제된 주제라면 헤더 초기화
        if (topic === a.textContent) {
          headerTitle.textContent = "주제를 선택해주세요.";
        }
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
