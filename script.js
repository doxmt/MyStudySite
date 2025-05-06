document.addEventListener("DOMContentLoaded", () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");

  addTopicBtn.addEventListener("click", () => {
    const newTopic = prompt("추가할 주제 이름을 입력하세요:");

    if (newTopic && newTopic.trim() !== "") {
      const li = document.createElement("li");

      // 링크
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = newTopic;
      a.dataset.topic = "topic" + Date.now();

      // 삭제 버튼
      const delBtn = document.createElement("button");
      delBtn.textContent = "X"; // <- X로 바꿈
      delBtn.className = "delete-btn";

      // 삭제 기능
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 링크 클릭 방지
        topicList.removeChild(li);
      });

      li.appendChild(a);
      li.appendChild(delBtn);
      topicList.insertBefore(li, addTopicBtn);
    }
  });

  // 기존 항목도 삭제 기능 붙이려면 여기에 forEach 추가 가능
});
