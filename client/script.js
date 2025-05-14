import { API_BASE } from './utils/api.js'; // ← TypeScript 컴파일 후 .js로 접근

document.addEventListener("DOMContentLoaded", async () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const partList = document.getElementById("part-list-items");
  const mainTitle = document.getElementById("main-title");

  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  const topics = await loadTopicsFromServer();
  topics.forEach(createTopicElement);

  const parts = await loadAllPartsFromServer();
  renderParts(parts);

  addTopicBtn.addEventListener("click", async () => {
    const newTopic = prompt("추가할 주제 이름을 입력하세요:");
    if (!newTopic || !newTopic.trim()) return;

    const trimmedTopic = newTopic.trim();
    if (topics.includes(trimmedTopic)) {
      alert("이미 존재하는 주제입니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedTopic })
      });

      if (!res.ok) throw new Error("추가 실패");

      topics.push(trimmedTopic);
      createTopicElement(trimmedTopic);
    } catch (err) {
      console.error("❌ 주제 추가 실패", err);
    }
  });

  function createTopicElement(topic) {
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
        await fetch(`${API_BASE}/api/topics?name=${encodeURIComponent(topic)}`, {
          method: "DELETE"
        });
        topicList.removeChild(li);
      } catch (err) {
        console.error("❌ 주제 삭제 실패", err);
      }
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    topicList.insertBefore(li, addTopicBtn);
  }

  function renderParts(parts) {
    partList.innerHTML = "";

    if (parts.length === 0) {
      partList.innerHTML = "<li>추가된 파트가 없습니다.</li>";
      return;
    }

    parts.forEach(({ topic, part }) => {
      createPartElement(topic, part);
    });
  }

  function createPartElement(topic, part) {
    const li = document.createElement("li");
    li.textContent = `${topic} - ${part}`;
    li.className = "part-item";

    li.addEventListener("click", () => {
      window.location.href = `part.html?topic=${encodeURIComponent(topic)}&part=${encodeURIComponent(part)}`;
    });

    partList.appendChild(li);
  }

  async function loadTopicsFromServer() {
    try {
      const res = await fetch(`${API_BASE}/api/topics`);
      const topics = await res.json();
      return topics.map(t => t.name);
    } catch (err) {
      console.error("❌ 주제 불러오기 실패", err);
      return [];
    }
  }

  async function loadAllPartsFromServer() {
    try {
      const res = await fetch(`${API_BASE}/api/contents/all`);
      return await res.json();
    } catch (err) {
      console.error("❌ 파트 불러오기 실패", err);
      return [];
    }
  }
});
