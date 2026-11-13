const DEFAULT_SUBJECTS = [
  {
    id: "math",
    name: "Математика",
    questions: [
      { question: "Сколько будет 7 × 8?", answers: ["54", "56", "64", "48"], correctAnswer: 1 },
      { question: "Чему равна сумма углов треугольника?", answers: ["90°", "180°", "270°", "360°"], correctAnswer: 1 },
      { question: "Какое число является простым?", answers: ["21", "27", "29", "33"], correctAnswer: 2 },
      { question: "Чему равен квадрат числа 12?", answers: ["124", "132", "144", "122"], correctAnswer: 2 },
      { question: "Сколько будет 15% от 200?", answers: ["15", "20", "30", "35"], correctAnswer: 2 }
    ]
  },
  {
    id: "physics",
    name: "Физика",
    questions: [
      { question: "В каких единицах измеряется сила?", answers: ["Ватт", "Ньютон", "Паскаль", "Джоуль"], correctAnswer: 1 },
      { question: "Какова приблизительная скорость света в вакууме?", answers: ["300 000 км/с", "30 000 км/с", "3 000 км/с", "300 км/с"], correctAnswer: 0 },
      { question: "Как называется прибор для измерения температуры?", answers: ["Барометр", "Термометр", "Амперметр", "Динамометр"], correctAnswer: 1 },
      { question: "Какая сила притягивает предметы к Земле?", answers: ["Сила трения", "Сила упругости", "Сила тяжести", "Сила Архимеда"], correctAnswer: 2 },
      { question: "В каких единицах измеряется электрический ток?", answers: ["Вольт", "Ом", "Ампер", "Ватт"], correctAnswer: 2 }
    ]
  },
  {
    id: "history",
    name: "История",
    questions: [
      { question: "В каком году состоялся первый полёт человека в космос?", answers: ["1957", "1961", "1969", "1975"], correctAnswer: 1 },
      { question: "Какой город был столицей Древнего Рима?", answers: ["Афины", "Александрия", "Рим", "Спарта"], correctAnswer: 2 },
      { question: "В каком году закончилась Вторая мировая война?", answers: ["1943", "1944", "1945", "1946"], correctAnswer: 2 },
      { question: "Как назывался древний торговый путь между Востоком и Западом?", answers: ["Янтарный путь", "Шёлковый путь", "Соляной путь", "Королевская дорога"], correctAnswer: 1 },
      { question: "Кто был первым президентом США?", answers: ["Авраам Линкольн", "Джордж Вашингтон", "Томас Джефферсон", "Джон Адамс"], correctAnswer: 1 }
    ]
  }
];

const SUBJECTS_KEY = "subjectQuizSubjects";
const LEADERS_KEY = "subjectQuizLeaders";
const NEW_SUBJECT_VALUE = "__new_subject__";
const ALL_SUBJECTS_VALUE = "__all_subjects__";

const elements = {
  notice: document.querySelector("#app-notice"),
  tabs: [...document.querySelectorAll(".tab-button")],
  views: {
    student: document.querySelector("#student-view"),
    teacher: document.querySelector("#teacher-view"),
    leaderboard: document.querySelector("#leaderboard-view")
  },
  studentSubject: document.querySelector("#student-subject"),
  subjectDescription: document.querySelector("#subject-description"),
  studentHome: document.querySelector("#student-home"),
  quizScreen: document.querySelector("#quiz-screen"),
  resultScreen: document.querySelector("#result-screen"),
  questionCount: document.querySelector("#question-count"),
  progressLabel: document.querySelector("#progress-label"),
  progressTrack: document.querySelector(".progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  questionText: document.querySelector("#question-text"),
  answerList: document.querySelector("#answer-list"),
  selectionHint: document.querySelector("#selection-hint"),
  nextButton: document.querySelector("#next-button"),
  resultScore: document.querySelector("#result-score"),
  resultMessage: document.querySelector("#result-message"),
  scoreForm: document.querySelector("#score-form"),
  playerName: document.querySelector("#player-name"),
  restartButton: document.querySelector("#restart-button"),
  changeSubjectButton: document.querySelector("#change-subject-button"),
  teacherForm: document.querySelector("#teacher-form"),
  teacherSubject: document.querySelector("#teacher-subject"),
  newSubjectField: document.querySelector("#new-subject-field"),
  newSubjectName: document.querySelector("#new-subject-name"),
  builderHint: document.querySelector("#builder-hint"),
  questionBuilder: document.querySelector("#question-builder"),
  addQuestionButton: document.querySelector("#add-question-button"),
  leaderboardSubject: document.querySelector("#leaderboard-subject"),
  leaderboardContent: document.querySelector("#leaderboard-content")
};

function showNotice(message, isError = false) {
  elements.notice.textContent = message;
  elements.notice.classList.toggle("is-error", isError);
  elements.notice.hidden = !message;
}

function readStorage(key, fallback, validator) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;

    const parsed = JSON.parse(stored);
    if (!validator(parsed)) {
      showNotice(`Не удалось прочитать сохранённые данные (${key}): формат повреждён. Используются встроенные данные.`, true);
      return fallback;
    }
    return parsed;
  } catch (error) {
    showNotice(`Не удалось прочитать сохранённые данные: ${error.message}`, true);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showNotice(`Не удалось сохранить данные в этом браузере: ${error.message}`, true);
    return false;
  }
}

function isValidQuestion(question) {
  return question !== null
    && typeof question === "object"
    && typeof question.question === "string"
    && question.question.trim().length > 0
    && Array.isArray(question.answers)
    && question.answers.length >= 2
    && question.answers.every((answer) => typeof answer === "string" && answer.trim().length > 0)
    && Number.isInteger(question.correctAnswer)
    && question.correctAnswer >= 0
    && question.correctAnswer < question.answers.length;
}

function isValidSubject(subject) {
  return subject !== null
    && typeof subject === "object"
    && typeof subject.id === "string"
    && typeof subject.name === "string"
    && subject.name.trim().length > 0
    && Array.isArray(subject.questions)
    && subject.questions.length > 0
    && subject.questions.every(isValidQuestion);
}

function isValidStoredSubjects(value) {
  return Array.isArray(value) && value.every(isValidSubject);
}

function isValidLeader(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.subjectId === "string"
    && typeof value.subjectName === "string"
    && typeof value.name === "string"
    && Number.isInteger(value.score)
    && Number.isInteger(value.total)
    && value.score >= 0
    && value.score <= value.total
    && value.total > 0
    && Number.isFinite(value.timestamp);
}

function isValidStoredLeaders(value) {
  return Array.isArray(value) && value.every(isValidLeader);
}

function loadSubjects() {
  const savedSubjects = readStorage(SUBJECTS_KEY, [], isValidStoredSubjects);
  const merged = new Map(DEFAULT_SUBJECTS.map((subject) => [subject.id, subject]));
  savedSubjects.forEach((subject) => merged.set(subject.id, subject));
  return [...merged.values()];
}

let subjects = loadSubjects();
let leaders = readStorage(LEADERS_KEY, [], isValidStoredLeaders);
let activeView = "student";
let currentSubject = null;
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let score = 0;
let scoreSaved = false;

function setView(viewName) {
  activeView = viewName;
  Object.entries(elements.views).forEach(([name, view]) => {
    view.hidden = name !== viewName;
  });
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.view === viewName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  if (viewName === "leaderboard") renderLeaderboard();
}

function fillSubjectSelect(select, selectedValue, includeCreateOption = false) {
  select.replaceChildren();
  if (select === elements.leaderboardSubject) {
    const option = document.createElement("option");
    option.value = ALL_SUBJECTS_VALUE;
    option.textContent = "Все предметы";
    select.append(option);
  }
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    select.append(option);
  });
  if (includeCreateOption) {
    const option = document.createElement("option");
    option.value = NEW_SUBJECT_VALUE;
    option.textContent = "+ Создать новый предмет";
    select.append(option);
  }
  const available = [...select.options].some((option) => option.value === selectedValue);
  if (available) select.value = selectedValue;
}

function refreshSubjectSelects() {
  const studentValue = elements.studentSubject.value || subjects[0]?.id;
  const teacherValue = elements.teacherSubject.value || subjects[0]?.id;
  const leaderValue = elements.leaderboardSubject.value || ALL_SUBJECTS_VALUE;
  fillSubjectSelect(elements.studentSubject, studentValue);
  fillSubjectSelect(elements.teacherSubject, teacherValue, true);
  fillSubjectSelect(elements.leaderboardSubject, leaderValue);
  updateSubjectDescription();
}

function updateSubjectDescription() {
  const subject = subjects.find((item) => item.id === elements.studentSubject.value);
  elements.subjectDescription.textContent = subject
    ? `${subject.questions.length} ${subject.questions.length === 1 ? "вопрос" : subject.questions.length < 5 ? "вопроса" : "вопросов"} в тесте`
    : "";
}

function beginQuiz() {
  currentSubject = subjects.find((subject) => subject.id === elements.studentSubject.value);
  if (!currentSubject || currentSubject.questions.length === 0) {
    showNotice("У выбранного предмета пока нет вопросов.", true);
    return;
  }
  currentQuestionIndex = 0;
  selectedAnswerIndex = null;
  score = 0;
  scoreSaved = false;
  elements.scoreForm.reset();
  elements.scoreForm.querySelector('button[type="submit"]').disabled = false;
  elements.scoreForm.querySelector('button[type="submit"]').textContent = "Сохранить результат";
  elements.studentHome.hidden = true;
  elements.resultScreen.hidden = true;
  elements.quizScreen.hidden = false;
  renderQuestion();
  showNotice("");
}

function renderQuestion() {
  const question = currentSubject.questions[currentQuestionIndex];
  const total = currentSubject.questions.length;
  const questionNumber = currentQuestionIndex + 1;
  elements.questionCount.textContent = `Вопрос ${questionNumber} из ${total}`;
  elements.progressLabel.textContent = `${Math.round(((questionNumber - 1) / total) * 100)}% пройдено`;
  elements.progressTrack.setAttribute("aria-valuemax", String(total));
  elements.progressTrack.setAttribute("aria-valuenow", String(questionNumber - 1));
  elements.progressFill.style.width = `${((questionNumber - 1) / total) * 100}%`;
  elements.questionText.textContent = question.question;
  elements.selectionHint.textContent = "Выбери один вариант ответа";
  selectedAnswerIndex = null;
  elements.nextButton.disabled = true;
  elements.nextButton.innerHTML = questionNumber === total
    ? 'Узнать результат <span aria-hidden="true">→</span>'
    : 'Следующий вопрос <span aria-hidden="true">→</span>';

  elements.answerList.replaceChildren();
  question.answers.forEach((answer, answerIndex) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "answer-option";
    option.setAttribute("aria-pressed", "false");

    const marker = document.createElement("span");
    marker.className = "option-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "✓";
    const label = document.createElement("span");
    label.textContent = answer;
    option.append(marker, label);
    option.addEventListener("click", () => selectAnswer(answerIndex));
    elements.answerList.append(option);
  });
}

function selectAnswer(answerIndex) {
  selectedAnswerIndex = answerIndex;
  elements.answerList.querySelectorAll(".answer-option").forEach((option, index) => {
    option.setAttribute("aria-pressed", String(index === answerIndex));
  });
  elements.selectionHint.textContent = "Ответ выбран";
  elements.nextButton.disabled = false;
}

function advanceQuiz() {
  if (selectedAnswerIndex === null || !currentSubject) return;
  if (selectedAnswerIndex === currentSubject.questions[currentQuestionIndex].correctAnswer) score += 1;
  currentQuestionIndex += 1;
  if (currentQuestionIndex === currentSubject.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  elements.quizScreen.hidden = true;
  elements.resultScreen.hidden = false;
  elements.progressTrack.setAttribute("aria-valuenow", String(currentSubject.questions.length));
  elements.progressFill.style.width = "100%";
  elements.resultScore.textContent = `Вы набрали ${score} из ${currentSubject.questions.length} баллов`;
  elements.resultMessage.textContent = score === currentSubject.questions.length
    ? `Отличный результат по предмету «${currentSubject.name}»!`
    : "Результат сохранится в таблице лидеров, если введёшь своё имя.";
  elements.playerName.focus();
}

function sortLeaders(entries) {
  return [...entries].sort((first, second) => second.score - first.score || first.timestamp - second.timestamp);
}

function saveScore(event) {
  event.preventDefault();
  if (!currentSubject || scoreSaved) return;

  const name = elements.playerName.value.trim();
  if (!name) {
    elements.playerName.focus();
    showNotice("Введи имя, чтобы сохранить результат.", true);
    return;
  }

  const entry = {
    subjectId: currentSubject.id,
    subjectName: currentSubject.name,
    name: name.slice(0, 30),
    score,
    total: currentSubject.questions.length,
    timestamp: Date.now()
  };
  const subjectEntries = sortLeaders([...leaders.filter((leader) => leader.subjectId === entry.subjectId), entry]).slice(0, 5);
  const nextLeaders = [...leaders.filter((leader) => leader.subjectId !== entry.subjectId), ...subjectEntries];
  if (!writeStorage(LEADERS_KEY, nextLeaders)) return;

  leaders = nextLeaders;
  scoreSaved = true;
  const submitButton = elements.scoreForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Результат сохранён";
  elements.leaderboardSubject.value = ALL_SUBJECTS_VALUE;
  renderLeaderboard();
  showNotice(`Результат ${name} сохранён в общем топе лидеров.`);
  setView("leaderboard");
}

function createQuestionEntry(index) {
  const entry = document.createElement("section");
  entry.className = "question-entry";
  entry.dataset.questionEntry = "";

  const heading = document.createElement("div");
  heading.className = "question-entry-heading";
  const title = document.createElement("h3");
  title.className = "question-entry-title";
  title.textContent = `Вопрос ${index + 1}`;
  heading.append(title);
  if (index > 0) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-question";
    removeButton.textContent = "Удалить";
    removeButton.addEventListener("click", () => {
      const drafts = readQuestionDrafts();
      drafts.splice(index, 1);
      renderQuestionBuilder(drafts);
    });
    heading.append(removeButton);
  }
  entry.append(heading);

  const questionInput = document.createElement("input");
  questionInput.className = "form-control teacher-question-input";
  questionInput.dataset.questionText = "";
  questionInput.maxLength = 300;
  questionInput.placeholder = "Текст вопроса";
  questionInput.setAttribute("aria-label", `Текст вопроса ${index + 1}`);
  entry.append(questionInput);

  const answerFields = document.createElement("div");
  answerFields.className = "answer-fields";
  for (let answerIndex = 0; answerIndex < 4; answerIndex += 1) {
    const row = document.createElement("label");
    row.className = "teacher-answer";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `correct-answer-${index}`;
    radio.value = String(answerIndex);
    radio.checked = answerIndex === 0;
    radio.setAttribute("aria-label", `Правильный вариант ${answerIndex + 1} для вопроса ${index + 1}`);
    const answerInput = document.createElement("input");
    answerInput.className = "form-control";
    answerInput.dataset.answer = "";
    answerInput.maxLength = 200;
    answerInput.placeholder = `Вариант ${answerIndex + 1}`;
    answerInput.setAttribute("aria-label", `Вариант ${answerIndex + 1} для вопроса ${index + 1}`);
    row.append(radio, answerInput);
    answerFields.append(row);
  }
  entry.append(answerFields);
  return entry;
}

function renderQuestionBuilder(drafts) {
  elements.questionBuilder.replaceChildren();
  drafts.forEach((draft, index) => {
    const entry = createQuestionEntry(index);
    entry.querySelector("[data-question-text]").value = draft.question || "";
    entry.querySelectorAll("[data-answer]").forEach((input, answerIndex) => {
      input.value = draft.answers?.[answerIndex] || "";
    });
    const correctRadio = entry.querySelector(`input[type="radio"][value="${draft.correctAnswer ?? 0}"]`);
    if (correctRadio) correctRadio.checked = true;
    elements.questionBuilder.append(entry);
  });
  updateBuilderHint();
}

function readQuestionDrafts() {
  return [...elements.questionBuilder.querySelectorAll("[data-question-entry]")].map((entry) => ({
    question: entry.querySelector("[data-question-text]").value.trim(),
    answers: [...entry.querySelectorAll("[data-answer]")].map((input) => input.value.trim()),
    correctAnswer: Number(entry.querySelector('input[type="radio"]:checked')?.value ?? 0)
  }));
}

function updateBuilderHint() {
  const isNewSubject = elements.teacherSubject.value === NEW_SUBJECT_VALUE;
  const count = elements.questionBuilder.querySelectorAll("[data-question-entry]").length;
  elements.builderHint.textContent = isNewSubject
    ? `Для нового предмета нужно минимум 5 вопросов. Сейчас: ${count}.`
    : "Новый вопрос будет добавлен к выбранному предмету.";
}

function validateDrafts(drafts) {
  const invalidIndex = drafts.findIndex((draft) => !isValidQuestion(draft));
  if (invalidIndex !== -1) {
    showNotice(`Заполни текст вопроса и все четыре варианта ответа для вопроса ${invalidIndex + 1}.`, true);
    const invalidEntry = elements.questionBuilder.querySelectorAll("[data-question-entry]")[invalidIndex];
    invalidEntry.querySelector("[data-question-text]").focus();
    return false;
  }
  return true;
}

function saveTest(event) {
  event.preventDefault();
  const drafts = readQuestionDrafts();
  if (!validateDrafts(drafts)) return;

  let updatedSubject;
  if (elements.teacherSubject.value === NEW_SUBJECT_VALUE) {
    const name = elements.newSubjectName.value.trim();
    if (!name) {
      showNotice("Введи название нового предмета.", true);
      elements.newSubjectName.focus();
      return;
    }
    if (subjects.some((subject) => subject.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      showNotice("Предмет с таким названием уже есть. Выбери его в списке, чтобы добавить вопросы.", true);
      elements.newSubjectName.focus();
      return;
    }
    if (drafts.length < 5) {
      showNotice("Для нового предмета добавь не менее 5 вопросов.", true);
      return;
    }
    updatedSubject = { id: `custom-${Date.now()}`, name, questions: drafts };
  } else {
    const selectedSubject = subjects.find((subject) => subject.id === elements.teacherSubject.value);
    if (!selectedSubject) {
      showNotice("Выбери предмет для сохранения.", true);
      return;
    }
    updatedSubject = { ...selectedSubject, questions: [...selectedSubject.questions, ...drafts] };
  }

  const nextSubjects = subjects.filter((subject) => subject.id !== updatedSubject.id).concat(updatedSubject);
  if (!writeStorage(SUBJECTS_KEY, nextSubjects.filter((subject) => !DEFAULT_SUBJECTS.some((base) => base.id === subject.id) || subject.questions.length !== baseQuestionCount(subject.id)))) {
    return;
  }

  subjects = nextSubjects;
  refreshSubjectSelects();
  elements.studentSubject.value = updatedSubject.id;
  elements.teacherSubject.value = updatedSubject.id;
  elements.leaderboardSubject.value = updatedSubject.id;
  updateSubjectDescription();
  currentSubject = null;
  elements.quizScreen.hidden = true;
  elements.resultScreen.hidden = true;
  elements.studentHome.hidden = false;
  elements.newSubjectName.value = "";
  renderQuestionBuilder([{ question: "", answers: ["", "", "", ""], correctAnswer: 0 }]);
  showNotice(`Тест «${updatedSubject.name}» сохранён. В нём ${updatedSubject.questions.length} вопросов.`);
  setView("student");
}

function baseQuestionCount(subjectId) {
  return DEFAULT_SUBJECTS.find((subject) => subject.id === subjectId)?.questions.length ?? 0;
}

function updateTeacherSubjectFields() {
  const isNewSubject = elements.teacherSubject.value === NEW_SUBJECT_VALUE;
  elements.newSubjectField.hidden = !isNewSubject;
  updateBuilderHint();
}

function renderLeaderboard() {
  const selectedSubjectId = elements.leaderboardSubject.value;
  const isAllSubjects = selectedSubjectId === ALL_SUBJECTS_VALUE;
  const subject = subjects.find((item) => item.id === selectedSubjectId);
  elements.leaderboardContent.replaceChildren();
  if (!isAllSubjects && !subject) return;

  const matchingEntries = isAllSubjects
    ? leaders
    : leaders.filter((entry) => entry.subjectId === subject.id);
  const bestEntries = sortLeaders(matchingEntries).slice(0, 5);
  if (bestEntries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "leaderboard-empty";
    empty.textContent = isAllSubjects
      ? "Пока нет сохранённых результатов. Пройди квиз и займи первое место!"
      : `Пока нет результатов по предмету «${subject.name}». Пройди квиз и займи первое место!`;
    elements.leaderboardContent.append(empty);
    return;
  }

  const list = document.createElement("ol");
  list.className = "leaderboard-list";
  bestEntries.forEach((entry, index) => {
    const row = document.createElement("li");
    row.className = "leaderboard-row";
    const rank = document.createElement("span");
    rank.className = index === 0 ? "rank is-first" : "rank";
    rank.textContent = `${index + 1}.`;
    const name = document.createElement("span");
    name.className = "leader-name";
    name.textContent = entry.name;
    if (isAllSubjects) {
      const details = document.createElement("span");
      details.className = "leader-details";
      details.textContent = entry.subjectName;
      name.append(details);
    }
    const result = document.createElement("span");
    result.className = "leader-score";
    result.textContent = `${entry.score} / ${entry.total}`;
    row.append(rank, name, result);
    list.append(row);
  });
  elements.leaderboardContent.append(list);
}

elements.tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
elements.studentSubject.addEventListener("change", updateSubjectDescription);
document.querySelector("#start-button").addEventListener("click", beginQuiz);
elements.nextButton.addEventListener("click", advanceQuiz);
elements.scoreForm.addEventListener("submit", saveScore);
elements.restartButton.addEventListener("click", () => {
  elements.resultScreen.hidden = true;
  elements.studentHome.hidden = false;
});
elements.changeSubjectButton.addEventListener("click", () => {
  elements.resultScreen.hidden = true;
  elements.studentHome.hidden = false;
});
elements.teacherSubject.addEventListener("change", updateTeacherSubjectFields);
elements.addQuestionButton.addEventListener("click", () => {
  const drafts = readQuestionDrafts();
  if (!validateDrafts(drafts)) return;
  drafts.push({ question: "", answers: ["", "", "", ""], correctAnswer: 0 });
  renderQuestionBuilder(drafts);
  elements.questionBuilder.lastElementChild.querySelector("[data-question-text]").focus();
});
elements.teacherForm.addEventListener("submit", saveTest);
elements.leaderboardSubject.addEventListener("change", renderLeaderboard);

refreshSubjectSelects();
renderQuestionBuilder([{ question: "", answers: ["", "", "", ""], correctAnswer: 0 }]);
updateTeacherSubjectFields();
