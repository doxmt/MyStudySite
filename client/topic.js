import { API_BASE } from './utils/api.js';


document.addEventListener("DOMContentLoaded", async () => {
  const topicList = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const addPartBtn = document.getElementById("add-part-btn");
  const partList = document.getElementById("part-list-items");
  const headerTitle = document.querySelector("header p");
  const mainTitle = document.getElementById("main-title");

  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  if (topic) {
    headerTitle.textContent = topic;
  } else {
    headerTitle.textContent = "주제를 선택해주세요.";
  }

  mainTitle.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // ✅ 서버에서 주제 및 파트 불러오기
  let topics = await loadTopicsFromServer();
  topics.forEach(createTopicElement);

  let subParts = topic ? await loadPartsFromServer(topic) : [];
  subParts.forEach(createPartElement);

  // ✅ 주제 추가
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
      if (!res.ok) throw new Error();

      topics.push(trimmed);
      createTopicElement(trimmed);
    } catch (err) {
      console.error("❌ 주제 추가 실패:", err);
    }
  });

  // ✅ 서브 파트 추가
  addPartBtn.addEventListener("click", async () => {
    if (!topic) return alert("주제를 먼저 선택해주세요.");

    const newPart = prompt("추가할 서브 파트 이름을 입력하세요:");
    if (!newPart || !newPart.trim()) return;

    const trimmed = newPart.trim();
    if (subParts.includes(trimmed)) {
      alert("이미 존재하는 서브 파트입니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/contents/${encodeURIComponent(topic)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: trimmed, content: "" })
      });
      if (!res.ok) throw new Error();

      subParts.push(trimmed);
      createPartElement(trimmed);
    } catch (err) {
      console.error("❌ 파트 추가 실패:", err);
    }
  });

  // ✅ 주제 항목 렌더링
  function createTopicElement(topicName) {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = `topic.html?topic=${encodeURIComponent(topicName)}`;
    a.textContent = topicName;

    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = confirm("정말 이 주제를 삭제하시겠습니까?");
      if (!ok) return;
    
      try {
        const res = await fetch(`${API_BASE}/api/topics?name=${encodeURIComponent(topicName)}`, {
          method: "DELETE"
        });
    
        if (!res.ok) throw new Error("삭제 실패");
    
        topicList.removeChild(li);
        topics = topics.filter(t => t !== topicName);
      } catch (err) {
        console.error("❌ 주제 삭제 실패:", err);
        alert("서버에서 삭제 실패");
      }
    });
    
    

    li.appendChild(a);
    li.appendChild(delBtn);
    topicList.insertBefore(li, addTopicBtn);
  }

  // ✅ 파트 항목 렌더링
  function createPartElement(part) {
    const li = document.createElement("li");
    li.textContent = part;
    li.className = "part-item";

    li.addEventListener("click", () => {
      window.location.href = `part.html?topic=${encodeURIComponent(topic)}&part=${encodeURIComponent(part)}`;
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = confirm("정말 이 서브 파트를 삭제하시겠습니까?");
      if (!ok) return;
    
      console.log("🧪 DELETE URL:", `${API_BASE}/api/contents/${encodeURIComponent(topic)}?part=${encodeURIComponent(part)}`);
    
      try {
        const res = await fetch(`${API_BASE}/api/contents/${encodeURIComponent(topic)}?part=${encodeURIComponent(part)}`, {
          method: "DELETE"
        });
    
        if (!res.ok) throw new Error("삭제 실패");
    
        partList.removeChild(li);
        subParts = subParts.filter(p => p !== part);
      } catch (err) {
        console.error("❌ 서브 파트 삭제 실패:", err);
        alert("서버에서 삭제 실패");
      }
    });
    

    li.appendChild(delBtn);
    partList.appendChild(li);
  }

  // ✅ 주제 불러오기
  async function loadTopicsFromServer() {
    try {
      const res = await fetch(`${API_BASE}/api/topics`);
      const data = await res.json();
      return data.map(t => t.name);
    } catch (err) {
      console.error("❌ 주제 불러오기 실패:", err);
      return [];
    }
  }

  // ✅ 파트 불러오기
  async function loadPartsFromServer(topic) {
    try {
      const res = await fetch(`${API_BASE}/api/contents/all`);
      const data = await res.json(); // [{ topic, part }]
      return data.filter(d => d.topic === topic).map(d => d.part);
    } catch (err) {
      console.error("❌ 파트 불러오기 실패:", err);
      return [];
    }
  }
});
