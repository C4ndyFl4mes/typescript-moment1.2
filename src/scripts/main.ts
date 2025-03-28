const cContainer: HTMLElement | null = document.getElementById("course-container");
const controls: HTMLElement | null = document.getElementById("controls-div");
const addCourseBTN: HTMLElement | null = document.getElementById("add-course");
const courseCodeINPUT = document.getElementById("coursecode-input") as HTMLInputElement | null;
const changeCourseCodeINPUT = document.getElementById("change-coursecode-input") as HTMLInputElement | null;
const courseNameINPUT = document.getElementById("coursename-input") as HTMLInputElement | null;
const progressionINPUT = document.getElementById("progression-input") as HTMLInputElement | null;
const urlINPUT = document.getElementById("url-input") as HTMLInputElement | null;
const editCheckBox = document.getElementById("edit-mode") as HTMLInputElement | null;
const changeCodeDIV = document.getElementById("change-code-div") as HTMLInputElement | null;
const addEditControlsTD: HTMLElement | null = document.getElementById("add-edit-controls");
let courseObjects: Array<Course> = [];

window.addEventListener<"load">("load", (): void => {
	const coursesStr: string | null = localStorage.getItem("courses");

	if (coursesStr) {
		const courses: Array<CourseInfo> = JSON.parse(coursesStr);
		courses.forEach(course => {
			const c = new Course(course);
			courseObjects.push(c);
			c.render();
		});
	}

	setGetControls();

});

/**
 * Anger innehållet i controls-div. 
 */
function setGetControls() {
	if (controls && cContainer && cContainer.innerHTML === "") {
		controls.innerHTML = "";
		const label = ce("label", null, null);
		label.setAttribute("for", "get-courses");
		label.textContent = "Du har inga sparade kurser, vill du hämta?";

		const gBTN = ce("button", "get-courses", "button");
		gBTN.textContent = "Hämta";
		gBTN.addEventListener<"click">("click", (): void => {
			getCourses();
		});

		if (controls) {
			controls.appendChild<HTMLElement>(label);
			controls.appendChild<HTMLElement>(gBTN);
		}
	}
}

/**
 * Beroende på om användaren befinner sig i ändringsläget eller inte.
 */
editCheckBox?.addEventListener<"change">("change", (): void => {
	if (addEditControlsTD && changeCodeDIV) {
		resetInputs();
		if (editCheckBox.checked) {
			changeCodeDIV.style.display = "table-cell";
			addEditControlsTD.innerHTML = `
				<label for="edit-course">
					<span>Vill du ändra kurs?</span>
              		<button id="edit-course" class="button">Ändra</button>
				</label>
				<label for="delete-course">
					<span>Eller radera?</span>
              		<button id="delete-course" class="button">Radera</button>
				</label>
				<label for="clear-course">
					<span>Eller radera alla kurser?</span>
					<button id="clear-course" class="button">Töm</button>
				</label>`;
			const editBTN: HTMLElement | null = document.getElementById("edit-course");
			editBTN?.addEventListener<"click">("click", (): void => {
				editCourse();
			});

			const deleteBTN: HTMLElement | null = document.getElementById("delete-course");
			deleteBTN?.addEventListener<"click">("click", (): void => {
				deleteCourse();
			});

			const clearBTN: HTMLElement | null = document.getElementById("clear-course");
			clearBTN?.addEventListener<"click">("click", (): void => {
				clearCourses();
			});
		} else {
			changeCodeDIV.style.display = "none";
			addEditControlsTD.innerHTML = `
				<label for="add-course">
					<span>Vill du lägga till ny kurs?</span>
              		<button id="add-course" class="button">Lägg till</button>
				</label>`;
			const addBTN: HTMLElement | null = document.getElementById("add-course");
			addBTN?.addEventListener<"click">("click", addButtons);
		}
	}

});

addCourseBTN?.addEventListener<"click">("click", addButtons);

/**
 * En gemensam funktion för de två knapparna addCourseBTN och addBTN. Hämtar värden från inmatningsfält och validerar informationen innan
 * createCourse anropas.
 */
function addButtons(): void {
	const code: string | null = getValInput("coursecode-input");
	const name: string | null = getValInput("coursename-input");
	const progression: string | null = getValInput("progression-input");
	const url: string | null = getValInput("url-input");

	if (code && name && progression) {
		if (!courseExists(code)) {
			if (checkProgression(progression)) {
				createCourse(code, name, progression, url ?? undefined);
			} else {
				console.log("Progression måste vara antingen A, B eller C.");
				alert("Progression måste vara antingen A, B eller C.");
			}
		} else {
			console.log("Kurskoder måste vara unika.");
			alert("Kurskoder måste vara unika.");
		}
	} else {
		console.log("Alla fält förutom länk är obligatoriska.");
		alert("Alla fält förutom länk är obligatoriska.");
	}
}

// Används som valmöjligheter tillsammans med en ternär operator i funktionen nedan.
type ValidationState = "normal" | "selected" | "conflict";

/**
 * En generisk funktion som ändrar vilka css klasser som finns på ett element vid konflikt, vald, eller normal.
 * @param element - det element som ska påverkas.
 * @param state - vilken status den har, normal, vald eller påvisar en konflikt.
 */
function updateValidationCSS<T extends HTMLElement>(element: T, state: ValidationState): void {
	const baseClass = element instanceof HTMLInputElement ? "input" : "row";
	element.className = state === "normal" ? baseClass : `${baseClass} ${state}`; // Om det är ett inputelement som har konflikt blir klasserna "input conflict".
}

/**
 * Beroende på ifall användaren är i ändringsläget eller inte. Om inte agerar den som att skapa ny och om i ändringsläget för att ändra.
 */
courseCodeINPUT?.addEventListener<"input">("input", (): void => {
	const code: string | null = getValInput("coursecode-input");
	if (editCheckBox && courseNameINPUT && progressionINPUT && urlINPUT && changeCourseCodeINPUT) {
		if (editCheckBox.checked) {
			if (code) {
				const course: Course = courseObjects.filter(course => course.getCourseInfo().code === code)[0];
				if (courseExists(code)) {
					updateValidationCSS(courseCodeINPUT, "selected");
					if (course) {
						updateValidationCSS(course.getRow(), "selected");
						courseNameINPUT.value = course.getCourseInfo().coursename;
						progressionINPUT.value = course.getCourseInfo().progression;
						const url: string | undefined = course.getCourseInfo().syllabus;
						changeCourseCodeINPUT.value = course.getCourseInfo().code;
						if (url) {
							urlINPUT.value = url;
						}
					}
				} else {
					updateValidationCSS(courseCodeINPUT, "conflict");
					courseObjects.forEach(c => {
						updateValidationCSS(c.getRow(), "normal");
					});
					courseNameINPUT.value = "";
					progressionINPUT.value = "";
					urlINPUT.value = "";
					changeCourseCodeINPUT.value = "";
				}
			} else if (code === "") {
				updateValidationCSS(courseCodeINPUT, "normal");
			}
		} else {
			if (code) {
				const course: Course = courseObjects.filter(course => course.getCourseInfo().code === code)[0];
				if (courseExists(code)) {
					updateValidationCSS(courseCodeINPUT, "conflict");
					if (course) {
						updateValidationCSS(course.getRow(), "conflict");
					}
				} else {
					updateValidationCSS(courseCodeINPUT, "normal");
					courseObjects.forEach(c => {
						updateValidationCSS(c.getRow(), "normal");
					});
				}
			} else if (code === "") {
				updateValidationCSS(courseCodeINPUT, "normal");
			}
		}
	}
});

/**
 * Validerar ifall den nya kurskoden fungerar.
 */
changeCourseCodeINPUT?.addEventListener<"input">("input", (): void => {
	const code: string | null = getValInput("coursecode-input");
	const newCode: string | null = getValInput("change-coursecode-input");
	if (code && newCode) {
		const course: Course = courseObjects.filter(course => course.getCourseInfo().code === newCode)[0];
		if (courseExists(newCode)) {
			updateValidationCSS(changeCourseCodeINPUT, "conflict");
			if (course) {
				updateValidationCSS(course.getRow(), "conflict");
			}
			if (code === newCode) {
				updateValidationCSS(changeCourseCodeINPUT, "selected");
				updateValidationCSS(course.getRow(), "selected");
			}
		} else {
			updateValidationCSS(changeCourseCodeINPUT, "normal");
			courseObjects.forEach(c => {
				if (c.getCourseInfo().code !== code) {
					updateValidationCSS(c.getRow(), "normal");
				}
			});
		}
	} else if (newCode === "") {
		updateValidationCSS(changeCourseCodeINPUT, "normal");
	}
});

/**
 * Validerar progression.
 */
progressionINPUT?.addEventListener<"input">("input", (): void => {
	const progression: string | null = getValInput("progression-input");
	if (progression) {
		if (checkProgression(progression)) {
			updateValidationCSS(progressionINPUT, "normal");
		} else {
			updateValidationCSS(progressionINPUT, "conflict");
		}
	} else if (progression === "") {
		updateValidationCSS(progressionINPUT, "normal");
	}
});


/**
 * Återställer inmatningsfälten och listans färger.
 */
function resetInputs(): void {
	if (editCheckBox && courseCodeINPUT && courseNameINPUT && progressionINPUT && urlINPUT && changeCourseCodeINPUT) {
		courseCodeINPUT.value = "";
		updateValidationCSS(courseCodeINPUT, "normal");
		courseNameINPUT.value = "";
		progressionINPUT.value = "";
		updateValidationCSS(progressionINPUT, "normal");
		urlINPUT.value = "";
		changeCourseCodeINPUT.value = "";
		updateValidationCSS(changeCourseCodeINPUT, "normal");
	}
	courseObjects.forEach(c => {
		updateValidationCSS(c.getRow(), "normal");
	});
}

/**
 * Hämtar kurser. Den validerar inte, men ska inte vara ett bekymmer för knappen finns enbart när listan är tom.
 */
async function getCourses(): Promise<void> {
	try {
		const resp: Response = await fetch("https://webbutveckling.miun.se/files/ramschema_ht24.json");
		const data: Array<CourseInfo> = await resp.json();
		console.log(data);
		data.forEach(d => {
			createCourse(d.code, d.coursename, d.progression, d.syllabus)
		});
		if (controls) {
			controls.innerHTML = "";
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * Hämtar ett sträng värde utifrån inmatningsfältets id.
 * @param {string} id - inmatningsfältets id. 
 * @returns ett sträng värde eller null. 
 */
function getValInput(id: string): string | null {
	const el = document.getElementById(id) as HTMLInputElement | null;
	if (el) {
		return el.value;
	} else {
		return null;
	}
}

/**
 * Tömmer listan, raderar klassobjekten och raderar courses från localStorage.
 */
function clearCourses(): void {
	if (cContainer && cContainer.innerHTML !== "") {
		courseObjects = [];
		localStorage.removeItem("courses");
		if (cContainer) {
			cContainer.innerHTML = "";
			if (cContainer.innerHTML === "") {
				setGetControls();
			}
		}
	} else {
		console.log("Listan är redan tom.");
		alert("Listan är redan tom.");
	}
}

/**
 * Raderar en kurs.
 */
function deleteCourse(): void {
	if (courseCodeINPUT) {
		if (courseExists(courseCodeINPUT.value)) {
			courseObjects = courseObjects.filter(course => course.getCourseInfo().code !== courseCodeINPUT.value);
			if (cContainer) {
				cContainer.innerHTML = "";
				courseObjects.forEach(c => {
					c.render();
				});
			}
			const coursesStr: string | null = localStorage.getItem("courses");
			if (coursesStr) {
				const courses: Array<CourseInfo> = JSON.parse(coursesStr);
				const updatedCourses = courses.filter(course => course.code !== courseCodeINPUT.value);
				localStorage.setItem("courses", JSON.stringify(updatedCourses));
			}
			resetInputs();
		} else {
			console.log("Det finns ingen kurs vid det namnet att radera.");
			alert("Det finns ingen kurs vid det namnet att radera.");
		}
	}
}

/**
 * Ändrar en kurs samt validerar ifall ändringen fungerar.
 */
function editCourse(): void {
	const code: string | null = getValInput("coursecode-input");
	const codeChange: string | null = getValInput("change-coursecode-input");
	const name: string | null = getValInput("coursename-input");
	const progression: string | null = getValInput("progression-input");
	const url: string | null = getValInput("url-input");

	if (codeChange && name && progression) {
		const course: Course = courseObjects.filter(course => course.getCourseInfo().code === code)[0];
		if (!courseExists(codeChange) || code === codeChange) {
			if (checkProgression(progression)) {
				if (courseCodeINPUT) courseCodeINPUT.value = codeChange;
				if (url) {
					course.editCode(codeChange);
					course.editName(name);
					course.editProgression(progression);
					course.editSyllabus(url);

					if (code) updateLocalStorage(code, codeChange, name, progression, url ?? undefined);
				} else {
					course.editCode(codeChange);
					course.editName(name);
					course.editProgression(progression);

					if (code) updateLocalStorage(code, codeChange, name, progression, url ?? undefined);
				}
				course.update();
			} else {
				console.log("Progression måste vara antingen A, B eller C.");
				alert("Progression måste vara antingen A, B eller C.");
			}
		} else {
			console.log("Kurskoder måste vara unika.");
			alert("Kurskoder måste vara unika.");
		}
	} else {
		console.log("Alla fält förutom länk är obligatoriska.");
		alert("Alla fält förutom länk är obligatoriska.");
	}
}

/**
 * För att uppdatera kurs i localStorage.
 * @param code - Nuvarande kurskod
 * @param codeChange - Ev. ny kurskod
 * @param name - Kursnamn.
 * @param progression - Progression
 * @param url - Länk
 */
function updateLocalStorage(code: string, codeChange: string, name: string, progression: string, url: string | undefined): void {
	const coursesStr: string | null = localStorage.getItem("courses");
	if (coursesStr) {
		const courses: Array<CourseInfo> = JSON.parse(coursesStr);

		if (url !== "") {
			const updatedCoursed = courses.map(course => course.code === code
				? { code: codeChange, coursename: name, progression: progression, syllabus: url }
				: course);
			localStorage.setItem("courses", JSON.stringify(updatedCoursed));

		} else {
			const updatedCoursed = courses.map(course => course.code === code
				? { code: codeChange, coursename: name, progression: progression }
				: course);
			localStorage.setItem("courses", JSON.stringify(updatedCoursed));
		}
	}
}

/**
 * Skapar en kurs.
 */
function createCourse(code: string, name: string, progression: string, url: string | undefined): void {
	let course: CourseInfo;
	if (url !== undefined) {
		course = {
			code: code,
			coursename: name,
			progression: progression,
			syllabus: url
		}
	} else {
		course = {
			code: code,
			coursename: name,
			progression: progression
		}
	}
	const newCourse = new Course(course);
	courseObjects.push(newCourse);
	newCourse.render();
	newCourse.storeInfo();
}

/**
 * Validerar en kurs på kurskod. Om det finns redan en kurs med kurskoden så returneras sant.
 * @param {string} code - kurskod som ska valideras.
 * @returns boolean
 */
function courseExists(code: string): boolean {
	const coursesStr: string | null = localStorage.getItem("courses");
	if (coursesStr) {
		const courses: Array<CourseInfo> = JSON.parse(coursesStr);
		return courses.some(course => course.code === code);
	} else {
		return false;
	}
}

/**
 * Validerar progression. Att progressionen är endast A, B eller C.
 * @param {string} progression  - progression som ska valideras.
 * @returns boolean
 */
function checkProgression(progression: string): boolean {
	return Object.values(Progression).includes(progression);
}

// Tillåtna värden för progression.
enum Progression { "A", "B", "C" };

/**
 * En mall för kursinfo, den information som lagras och skickas runt.
 */
interface CourseInfo {
	code: string;
	coursename: string;
	progression: string;
	syllabus?: string;
}

/**
 * En klass för att hantera en kurs i listan.
 */
class Course {
	private ci: CourseInfo;
	private tr: HTMLElement;
	private codeTD: HTMLElement;
	private courseNameTD: HTMLElement;
	private progressionTD: HTMLElement;

	constructor(ci: CourseInfo) {
		this.ci = ci;
		this.tr = document.createElement("tr");
		this.codeTD = document.createElement("td");
		this.courseNameTD = document.createElement("td");
		this.progressionTD = document.createElement("td");
	}

	private openPage = (): void => {
		window.open(this.ci.syllabus, "_blank");
	};

	getRow() {
		return this.tr;
	}

	getCourseInfo() {
		return this.ci;
	}

	editCode(newCode: string): void {
		this.ci.code = newCode;
	}

	editName(newName: string): void {
		this.ci.coursename = newName;
	}

	editProgression(newProgression: string): void {
		this.ci.progression = newProgression;
	}

	editSyllabus(newSyllabus: string): void {
		this.ci.syllabus = newSyllabus;
	}

	// Uppdaterar elementen i listan.
	update(): void {
		if (this.ci.syllabus) {
			this.tr.title = `Öppna ${this.ci.coursename} i ny flik`;
			this.tr.addEventListener<"click">("click", this.openPage);
		} else {
			this.tr.removeEventListener("click", this.openPage);
			this.tr.title = `${this.ci.coursename} har ingen länk`;
		}

		this.codeTD.textContent = this.ci.code;
		this.courseNameTD.textContent = this.ci.coursename;
		this.progressionTD.textContent = this.ci.progression;
	}

	// Lägger till informationen till sidan.
	render(): void {
		if (this.ci.syllabus) {
			this.tr.title = `Öppna ${this.ci.coursename} i ny flik`;
			this.tr.addEventListener<"click">("click", this.openPage);
		} else {
			this.tr.removeEventListener("click", this.openPage);
			this.tr.title = `${this.ci.coursename} har ingen länk`;
		}
		this.tr.className = "row";
		this.codeTD.textContent = this.ci.code;
		this.courseNameTD.textContent = this.ci.coursename;
		this.progressionTD.textContent = this.ci.progression;

		this.tr.appendChild(this.codeTD);
		this.tr.appendChild(this.courseNameTD);
		this.tr.appendChild(this.progressionTD);

		if (cContainer) {
			cContainer.appendChild(this.tr);
		}
	}

	// Lagrar informationen i localStorage.
	storeInfo(): void {
		const coursesStr: string | null = localStorage.getItem("courses");

		if (coursesStr !== null) {
			const courses: Array<CourseInfo> = JSON.parse(coursesStr);
			if (courses.some(course => course.code !== this.ci.code)) {
				courses.push(this.ci);

				localStorage.setItem("courses", JSON.stringify(courses));
			}

		} else {
			const courses: Array<CourseInfo> = [this.ci];
			localStorage.setItem("courses", JSON.stringify(courses));
		}
	}
}

/**
 * Kanske en onödig funktion som skapades för att skriva createElement snabbare.
 * @param type - vilken typ av element.
 * @param id - om den har ett id, i så fall vilket.
 * @param c - om den har en klass, i så fall vilken.
 * @returns 
 */
function ce(type: string, id: string | null, c: string | null): HTMLElement {
	const element: HTMLElement = document.createElement(type);
	if (id) {
		element.id = id;
	}
	if (c) {
		element.className = c;
	}

	return element;
}