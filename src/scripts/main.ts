const cContainer: HTMLElement | null = document.getElementById("course-container");
const controls: HTMLElement | null = document.getElementById("controls-div");

window.addEventListener<"load">("load", (): void => {
	// LocalStorage later...

	// console.log("a");
	const test: CourseInfo = {
		coursecode: "a",
		coursename: "abcd",
		progression: Progression.A
	};

	const tc = new Course(test);

	tc.render();

	if (cContainer && cContainer.innerHTML === "") {
		console.log("a");
		const label = ce("label", null, null);
		label.setAttribute("for", "get-courses");
		label.textContent = "Det finns inga kurser, vill du hämta nya?";

		const gBTN = ce("button", "get-courses", "button");
		gBTN.textContent = "Hämta";

		if (controls) {
			controls.appendChild<HTMLElement>(label);
			controls.appendChild<HTMLElement>(gBTN);
		}
	}
});

enum Progression { "A", "B", "C" };

interface CourseInfo {
	coursecode: string;
	coursename: string;
	progression: Progression;
	syllabus?: string;
}

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

	editProgression(newProgression: Progression): void {
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