const cContainer: HTMLElement | null = document.getElementById("course-container");
const controls: HTMLElement | null = document.getElementById("controls-div");
const addCourseBTN: HTMLElement | null = document.getElementById("add-course");

window.addEventListener<"load">("load", (): void => {
	

	if (cContainer && cContainer.innerHTML === "") {
		const label = ce("label", null, null);
		label.setAttribute("for", "get-courses");
		label.textContent = "Du har inga sparade kurser, vill du hämta?";

		const gBTN = ce("button", "get-courses", "button");
		gBTN.textContent = "Hämta";

		if (controls) {
			controls.appendChild<HTMLElement>(label);
			controls.appendChild<HTMLElement>(gBTN);
		}
	}
});

addCourseBTN?.addEventListener<"click">("click", () => {
	createCourseFromInput();
});

/**
 * 
 * @param id 
 * @returns 
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
 * 
 */
function createCourseFromInput(): void {
	const code: string | null = getValInput("coursecode-input");
	const name: string | null = getValInput("coursename-input");
	const progression: string | null = getValInput("progression-input");
	const url: string | null = getValInput("url-input");

	if (code && name && progression) {
		if (Object.values(Progression).includes(progression)) {
			let course: CourseInfo;
			if (url) {
				course = {
					coursecode: code,
					coursename: name,
					progression: progression,
					syllabus: url
				}
			} else {
				course = {
					coursecode: code,
					coursename: name,
					progression: progression
				}
			}
			const newCourse = new Course(course);
			newCourse.render();
		} else {
			console.log("Progression måste vara antingen A, B eller C.");
		}
	} else {
		console.log("Alla fält förutom länk är obligatoriska.");
	}
	
}

enum Progression { "A", "B", "C" };

interface CourseInfo {
	coursecode: string;
	coursename: string;
	progression: string;
	syllabus?: string;
}

/**
 * 
 */
class Course {
	private ci: CourseInfo;

	constructor(ci: CourseInfo) {
		this.ci = ci;
	}

	editCode(newCode: string): void {
		this.ci.coursecode = newCode;
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

	render(): void {
		const tr: HTMLElement = document.createElement("tr");

		if (this.ci.syllabus) {
			tr.title = `Öppna ${this.ci.coursename} i ny flik`;
			tr.addEventListener<"click">("click", (): void => {
				window.open(this.ci.syllabus, "_blank");
			});
		} else {
			tr.title = `${this.ci.coursename} har ingen länk`;
		}

		tr.innerHTML = `
      		<td>${this.ci.coursecode}</td>
      		<td>${this.ci.coursename}</td>
      		<td>${this.ci.progression}</td>
    	`;

		if (cContainer) {
			cContainer.appendChild(tr);
			this.storeInfo();
		}
	}

	storeInfo(): void {
		const coursesStr: string | null = localStorage.getItem("courses");
		
		if (coursesStr !== null) {
			const courses: Array<CourseInfo> = JSON.parse(coursesStr);
			if (courses.some(course => course.coursecode !== this.ci.coursecode)) {
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
	* 
	* @param type 
	* @param id 
	* @param c 
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