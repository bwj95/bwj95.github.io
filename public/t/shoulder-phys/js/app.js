/// State Management
let currentDateIso = new URLSearchParams(window.location.search).get("date") || new Date().toISOString().split("T")[0]
let calendarDate = new Date(currentDateIso + "T12:00:00")
let isNotepadCollapsed = true
let currentView = "dashboard"
let currentLibraryView = "sections"
let clipboard = JSON.parse(localStorage.getItem("rehab-clipboard")) || null
let isGroupBarVisible = false
let needsRefreshForDashboard = false

let routines = JSON.parse(localStorage.getItem("shoulderPhys-routines"))
if (!routines) {
    routines = defaultRoutineData
    saveRoutines()
}

let library = JSON.parse(localStorage.getItem("shoulderPhys-library"))
if (!library) {
    library = defaultLibrary
    saveLibrary()
}

let sessionNotes = JSON.parse(localStorage.getItem("shoulderPhys-notes")) || {}

function saveRoutines() {
    localStorage.setItem("shoulderPhys-routines", JSON.stringify(routines))
}

function saveLibrary() {
    localStorage.setItem("shoulderPhys-library", JSON.stringify(library))
}

function saveNotes() {
    localStorage.setItem("shoulderPhys-notes", JSON.stringify(sessionNotes))
}

function generateId() {
    return Math.random().toString(36).substring(2, 10)
}

/// Navigation & UI
function toggleSidebar(forceOpen = null) {
    const sidebar = document.querySelector(".sidebar")
    const overlay = document.getElementById("sidebarOverlay")

    if (forceOpen === true) {
        sidebar.classList.add("open")
        overlay.classList.add("active")
    } else if (forceOpen === false) {
        sidebar.classList.remove("open")
        overlay.classList.remove("active")
    } else {
        sidebar.classList.toggle("open")
        overlay.classList.toggle("active")
    }
}

function showView(viewName) {
    if (viewName === "dashboard" && needsRefreshForDashboard) {
        renderDashboard()
        needsRefreshForDashboard = false
    }

    currentView = viewName
    document.querySelectorAll(".content-view").forEach(v => v.classList.add("hidden"))
    document.getElementById(`view-${viewName}`).classList.remove("hidden")

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"))
    document.getElementById(`nav-${viewName}`).classList.add("active")

    toggleSidebar(false)

    const copyBtn = document.getElementById("copyDayBtn")
    if (copyBtn) {
        copyBtn.style.display = viewName === "dashboard" ? "flex" : "none"
    }

    if (viewName === "library") {
        if (currentLibraryView === "alpha") {
            populateAlphaLibrary()
        } else {
            renderLibrarySections()
        }
    }
}

/// Calendar Logic
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function renderCalendar() {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    document.getElementById("calMonthYear").textContent = `${monthNames[month]} ${year}`
    
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = getDaysInMonth(year, month)
    
    const calDaysContainer = document.getElementById("calDays")
    calDaysContainer.innerHTML = "<div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>"
    
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div")
        emptyDiv.className = "empty"
        calDaysContainer.appendChild(emptyDiv)
    }
    
    const todayIso = new Date().toISOString().split("T")[0]
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d)
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        
        const dayDiv = document.createElement("div")
        let classes = "day-num"
        if (iso === currentDateIso) classes += " active"
        if (iso === todayIso) classes += " is-today"
        if (routines[iso] && routines[iso].length > 0) classes += " has-work"
        
        dayDiv.className = classes
        dayDiv.textContent = d
        dayDiv.onclick = () => handleDateClick(iso)
        
        calDaysContainer.appendChild(dayDiv)
    }
}

function changeMonth(offset) {
    calendarDate.setMonth(calendarDate.getMonth() + offset)
    renderCalendar()
}

function handleDateClick(dateIso) {
    const stored = JSON.parse(localStorage.getItem("rehab-clipboard"))
    if (stored) {
        clipboard = stored
        const count = stored.ids ? stored.ids.length : "all"
        if (confirm(`Paste ${count} exercises into ${dateIso}?`)) {
            pasteToDate(dateIso, stored)
            return
        }
    }
    
    currentDateIso = dateIso
    calendarDate = new Date(currentDateIso + "T12:00:00")
    
    const url = new URL(window.location)
    url.searchParams.set("date", dateIso)
    window.history.pushState({}, "", url)
    
    renderDashboard()
}

/// Dashboard Rendering
function renderDashboard() {
    document.getElementById("topbarDate").textContent = currentDateIso
    renderCalendar()
    renderScheduledExercises()
    loadNotepad()
    updateBatchUI()
}

function renderScheduledExercises() {
    const container = document.getElementById("scheduledExercises")
    container.innerHTML = ""
    
    const activeExercises = routines[currentDateIso] || []
    
    if (activeExercises.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No exercises scheduled. Use search to add workouts.</p>
            </div>
        `
        return
    }
    
    activeExercises.forEach(ex => {
        container.insertAdjacentHTML("beforeend", renderExerciseCard(ex, currentDateIso))
    })
}

function renderExerciseCard(ex, dateIso) {
    return `
    <article class="phase-card glass ${ex.completed ? "completed" : ""}" id="ex-${ex.id}">
        <div class="category">${ex.category}</div>
        <h3>${ex.name}</h3>
        <p class="description">${ex.description || ""}</p>
        <div class="exercise-values">
            <span class="editable-value" contenteditable="true" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" onblur="updateExerciseValues('${dateIso}', '${ex.id}', this, 'sets')">${ex.sets}</span> sets
            <span>&bull;</span>
            <span class="editable-value" contenteditable="true" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" onblur="updateExerciseValues('${dateIso}', '${ex.id}', this, 'reps')">${ex.reps}</span>
        </div>
        <div class="card-actions" style="justify-content: flex-end; gap: 0.75rem;">
            <button class="icon-btn" onclick="toggleExercise('${dateIso}', '${ex.id}')" title="Toggle Completion">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button class="icon-btn" onclick="copySingle('${ex.id}', event)" title="Copy Exercise">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
            <button class="icon-btn delete" onclick="removeExercise('${dateIso}', '${ex.id}')" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
    </article>`
}

/// Exercise Actions
function promptAddExercise(name, category) {
    document.getElementById("searchResults").classList.add("hidden")
    document.getElementById("addExName").value = name
    document.getElementById("addExCat").value = category
    document.getElementById("modalTitle").textContent = name
    document.getElementById("modalSubcat").textContent = category
    document.getElementById("quickAddModal").classList.add("open")
}

function confirmAddExercise() {
    const name = document.getElementById("addExName").value
    const category = document.getElementById("addExCat").value
    const sets = document.getElementById("addSets").value
    const reps = document.getElementById("addReps").value
    
    let description = ""
    for (const mg of Object.keys(library)) {
        if (library[mg][category]) {
            const ex = library[mg][category].find(e => e.name === name)
            if (ex) description = ex.description
        }
    }
    
    const newEx = {
        id: generateId(),
        name,
        category,
        sets,
        reps,
        description,
        completed: false
    }
    
    if (!routines[currentDateIso]) {
        routines[currentDateIso] = []
    }
    
    routines[currentDateIso].push(newEx)
    saveRoutines()
    
    document.getElementById("quickAddModal").classList.remove("open")
    
    if (currentView === "dashboard") {
        renderDashboard()
    } else {
        needsRefreshForDashboard = true
        const btn = document.querySelector(`[onclick="promptAddExercise('${name.replace(/'/g, "\\'")}', '${category.replace(/'/g, "\\'")}')"]`)
        if (btn) {
            const oldBg = btn.style.background
            btn.style.background = "var(--success)"
            setTimeout(() => { btn.style.background = oldBg }, 800)
        }
    }
}

function toggleExercise(day, id) {
    if (routines[day]) {
        const ex = routines[day].find(e => e.id === id)
        if (ex) {
            ex.completed = !ex.completed
            saveRoutines()
            document.getElementById(`ex-${id}`).classList.toggle("completed", ex.completed)
            isGroupBarVisible = true
            updateBatchUI()
        }
    }
}

function removeExercise(day, id) {
    if (!confirm("Remove?")) return
    if (routines[day]) {
        routines[day] = routines[day].filter(e => e.id !== id)
        saveRoutines()
        renderDashboard()
    }
}

function updateExerciseValues(day, id, element, type) {
    const value = element.innerText.trim()
    if (routines[day]) {
        const ex = routines[day].find(e => e.id === id)
        if (ex) {
            ex[type] = value
            saveRoutines()
        }
    }
}

/// Batch Actions
function copyDay(event) {
    if (event) event.stopPropagation()
    clipboard = { sourceDay: currentDateIso, ids: null }
    localStorage.setItem("rehab-clipboard", JSON.stringify(clipboard))
    updateBatchUI()
}

function copySingle(id, event) {
    if (event) event.stopPropagation()
    clipboard = { sourceDay: currentDateIso, ids: [id] }
    localStorage.setItem("rehab-clipboard", JSON.stringify(clipboard))
    updateBatchUI()
}

function copyGroup() {
    const completedIds = Array.from(document.querySelectorAll(".phase-card.completed")).map(c => c.id.replace("ex-", ""))
    if (completedIds.length === 0) return
    clipboard = { sourceDay: currentDateIso, ids: completedIds }
    localStorage.setItem("rehab-clipboard", JSON.stringify(clipboard))
    isGroupBarVisible = false
    updateBatchUI()
}

function deleteGroup() {
    const completedIds = Array.from(document.querySelectorAll(".phase-card.completed")).map(c => c.id.replace("ex-", ""))
    if (completedIds.length === 0) return
    if (!confirm(`Delete ${completedIds.length} grouped exercises?`)) return

    if (routines[currentDateIso]) {
        routines[currentDateIso] = routines[currentDateIso].filter(e => !completedIds.includes(e.id))
        saveRoutines()
        renderDashboard()
        isGroupBarVisible = false
        updateBatchUI()
    }
}

function cancelGroup() {
    isGroupBarVisible = false
    updateBatchUI()
}

function updateBatchUI() {
    const bar = document.getElementById("batchBar")
    const status = document.getElementById("batchStatus")
    const calendars = document.querySelectorAll(".mini-calendar")
    const pasteActions = document.getElementById("pasteActions")
    const groupActions = document.getElementById("groupActions")

    const activeClipboard = clipboard || JSON.parse(localStorage.getItem("rehab-clipboard"))
    const completedCards = document.querySelectorAll(".phase-card.completed")
    const completedIds = Array.from(completedCards).map(c => c.id.replace("ex-", ""))

    if (activeClipboard) {
        let count = activeClipboard.ids ? activeClipboard.ids.length : "All"
        document.getElementById("selectedCount").textContent = `${count} Copied`
        status.textContent = "Paste Mode Active. Click a destination date on the calendar above."
        calendars.forEach(cal => cal.classList.add("paste-active"))
        bar.classList.add("active")
        if (pasteActions) pasteActions.style.display = "flex"
        if (groupActions) groupActions.style.display = "none"
    } else if (isGroupBarVisible && completedIds.length > 0) {
        document.getElementById("selectedCount").textContent = `${completedIds.length} Grouped`
        status.textContent = "Exercises are grouped. You can copy or delete them together."
        calendars.forEach(cal => cal.classList.remove("paste-active"))
        bar.classList.add("active")
        if (pasteActions) pasteActions.style.display = "none"
        if (groupActions) groupActions.style.display = "flex"
    } else {
        calendars.forEach(cal => cal.classList.remove("paste-active"))
        bar.classList.remove("active")
    }
}

function pasteToDate(targetDate, data) {
    if (!routines[targetDate]) {
        routines[targetDate] = []
    }
    
    const sourceDay = data.sourceDay
    if (routines[sourceDay]) {
        const toCopy = data.ids ? routines[sourceDay].filter(e => data.ids.includes(e.id)) : routines[sourceDay]
        toCopy.forEach(ex => {
            const newEx = { ...ex, id: generateId(), completed: false }
            routines[targetDate].push(newEx)
        })
        saveRoutines()
        cancelPaste()
        handleDateClick(targetDate)
    } else {
        alert("Source day has no exercises.")
    }
}

function cancelPaste() {
    localStorage.removeItem("rehab-clipboard")
    clipboard = null
    updateBatchUI()
}

document.addEventListener("click", (e) => {
    if (clipboard &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".batch-bar") &&
        !e.target.closest(".search-container") &&
        !e.target.closest(".calendar-wrapper") &&
        !e.target.closest(".phase-card") &&
        !e.target.closest(".icon-btn") &&
        !e.target.closest(".nav-link")) {
        cancelPaste()
    }
})

/// Library View
function renderLibrarySections() {
    const container = document.getElementById("library-sections")
    container.innerHTML = ""
    
    for (const [muscleGroup, subcats] of Object.entries(library)) {
        const details = document.createElement("details")
        details.className = "muscle-group-block"
        details.open = true
        
        details.innerHTML = `
            <summary class="muscle-group-title">
                ${muscleGroup}
                <svg class="collapse-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="muscle-group-content" style="padding-top: 1rem;">
            </div>
        `
        
        const contentDiv = details.querySelector(".muscle-group-content")
        
        for (const [subcat, exercises] of Object.entries(subcats)) {
            const subcatBlock = document.createElement("div")
            subcatBlock.className = "subcat-block"
            
            let html = `<h4 class="subcat-title">${subcat}</h4><div class="library-list">`
            exercises.forEach(ex => {
                html += `
                    <div class="library-item glass" onclick="promptAddExercise('${ex.name.replace(/'/g, "\\'")}', '${subcat.replace(/'/g, "\\'")}')">
                        <div class="name">${ex.name}</div>
                        <div class="desc">${ex.description}</div>
                    </div>
                `
            })
            html += `</div>`
            subcatBlock.innerHTML = html
            contentDiv.appendChild(subcatBlock)
        }
        
        container.appendChild(details)
    }
}

function switchLibraryView(viewType) {
    currentLibraryView = viewType
    document.getElementById("library-sections").classList.toggle("hidden", viewType !== "sections")
    document.getElementById("library-alpha").classList.toggle("hidden", viewType !== "alpha")
    document.getElementById("btn-view-sections").classList.toggle("active", viewType === "sections")
    document.getElementById("btn-view-alpha").classList.toggle("active", viewType === "alpha")
    if (viewType === "alpha") populateAlphaLibrary()
}

function populateAlphaLibrary() {
    const container = document.querySelector(".library-list.alpha")
    if (!container) return
    container.innerHTML = ""
    let allEx = []
    Object.keys(library).forEach(mg => {
        Object.keys(library[mg]).forEach(sub => {
            library[mg][sub].forEach(ex => allEx.push({ ...ex, mg, sub }))
        })
    })
    allEx.sort((a, b) => a.name.localeCompare(b.name)).forEach(ex => {
        const div = document.createElement("div")
        div.className = "library-item alpha-item glass"
        div.innerHTML = `<div><strong>${ex.name}</strong><br><small>${ex.mg} &rsaquo; ${ex.sub}</small></div>`
        div.onclick = () => promptAddExercise(ex.name, ex.sub)
        container.appendChild(div)
    })
}

/// Global Search
function initGlobalSearch() {
    const input = document.getElementById("globalSearch")
    const results = document.getElementById("searchResults")
    input.addEventListener("input", (e) => {
        const t = e.target.value.toLowerCase().trim()
        if (t.length < 2) { results.classList.add("hidden"); return }
        let matches = []
        Object.keys(library).forEach(mg => {
            Object.keys(library[mg]).forEach(sub => {
                library[mg][sub].forEach(ex => {
                    if (ex.name.toLowerCase().includes(t) || sub.toLowerCase().includes(t)) matches.push({ ...ex, sub })
                })
            })
        })
        if (matches.length > 0) {
            results.innerHTML = matches.slice(0, 8).map(m => `
                <div class="search-item" data-name="${m.name.replace(/"/g, "&quot;")}" data-cat="${m.sub.replace(/"/g, "&quot;")}">
                    <small style="color:var(--accent)">${m.sub}</small><br>
                    <strong>${m.name}</strong>
                </div>
            `).join("")
            results.classList.remove("hidden")
        } else results.classList.add("hidden")
    })

    results.addEventListener("click", (e) => {
        const item = e.target.closest(".search-item")
        if (item) {
            promptAddExercise(item.dataset.name, item.dataset.cat)
        }
    })

    document.addEventListener("click", (e) => { if (!e.target.closest(".search-container")) results.classList.add("hidden") })
}

function closeModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"))
}

/// Notepad Logic
function loadNotepad() {
    const saved = sessionNotes[currentDateIso] || ""
    document.getElementById("notepadContent").value = saved
}

function initNotepad() {
    const notepad = document.getElementById("floatingNotepad")
    const header = notepad.querySelector(".notepad-header")
    const resizer = document.getElementById("gtResizer")
    
    loadNotepad()

    let isD = false, sx, sy, il, it
    header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".notepad-btn") || e.target.closest(".theme-switcher")) return
        isD = true; sx = e.clientX; sy = e.clientY
        const r = notepad.getBoundingClientRect()
        il = r.left; it = r.top
        document.addEventListener("mousemove", drag)
        document.addEventListener("mouseup", stopD)
    })
    function drag(e) {
        if (!isD) return
        notepad.style.left = (il + (e.clientX - sx)) + "px"
        notepad.style.top = (it + (e.clientY - sy)) + "px"
        notepad.style.bottom = "auto"
        notepad.style.right = "auto"
    }
    function stopD() {
        isD = false
        document.removeEventListener("mousemove", drag)
        document.removeEventListener("mouseup", stopD)
    }

    let isR = false, iw, ih
    resizer.addEventListener("mousedown", (e) => {
        isR = true; sx = e.clientX; sy = e.clientY
        const r = notepad.getBoundingClientRect()
        iw = r.width; ih = r.height
        document.addEventListener("mousemove", resize)
        document.addEventListener("mouseup", stopR)
    })
    function resize(e) {
        if (!isR) return
        notepad.style.width = (iw + (e.clientX - sx)) + "px"
        notepad.style.height = (ih - (sy - e.clientY)) + "px"
    }
    function stopR() {
        isR = false
        document.removeEventListener("mousemove", resize)
        document.removeEventListener("mouseup", stopR)
    }

    document.getElementById("notepadContent").addEventListener("input", (e) => {
        sessionNotes[currentDateIso] = e.target.value
        saveNotes()
    })
}

function toggleNotepad() {
    const notepad = document.getElementById("floatingNotepad")
    isNotepadCollapsed = !isNotepadCollapsed

    if (!isNotepadCollapsed) {
        const rect = notepad.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        if (rect.top < 0) notepad.style.top = "10px"
        if (rect.left < 0) notepad.style.left = "10px"
        if (rect.right > viewportWidth) notepad.style.left = (viewportWidth - rect.width - 20) + "px"
    }

    notepad.classList.toggle("collapsed", isNotepadCollapsed)
    document.getElementById("gtChevron").style.transform = isNotepadCollapsed ? "rotate(180deg)" : "rotate(0deg)"
}

function clearNotepad() {
    if (confirm("Clear notes for this day?")) {
        document.getElementById("notepadContent").value = ""
        delete sessionNotes[currentDateIso]
        saveNotes()
    }
}

function saveNotepad() {
    const s = document.getElementById("saveStatus")
    s.textContent = "Saving..."
    sessionNotes[currentDateIso] = document.getElementById("notepadContent").value
    saveNotes()
    setTimeout(() => { s.textContent = "Saved!" }, 500)
    setTimeout(() => { s.textContent = "" }, 2000)
}

function setTheme(t) {
    document.body.setAttribute("data-theme", t)
    localStorage.setItem("rehab-theme", t)
    document.querySelectorAll(".theme-btn").forEach(b => b.classList.toggle("active", b.getAttribute("onclick").includes(t)))
}

document.addEventListener("DOMContentLoaded", () => {
    setTheme(localStorage.getItem("rehab-theme") || "water")
    initNotepad()
    initGlobalSearch()
    renderDashboard()
})
