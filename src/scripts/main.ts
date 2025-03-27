const cContainer: HTMLElement | null = document.getElementById("course-container");
const controls: HTMLElement | null = document.getElementById("controls-div");
const addCourseBTN: HTMLElement | null = document.getElementById("add-course");
const courseCodeINPUT = document.getElementById("coursecode-input") as HTMLInputElement | null;
const progressionINPUT = document.getElementById("progression-input") as HTMLInputElement | null;
const courseObjects: Array<Course> = [];

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


	if (cContainer && cContainer.innerHTML === "") {
		const label = ce("label", null, null);
		label.setAttribute("for", "get-courses");
		label.textContent = "Du har inga sparade kurser, vill du hämta?";

		const gBTN = ce("button", "get-courses", "button");
		gBTN.textContent = "Hämta";
		gBTN.addEventListener<"click">("click", (): void => {
			getCourses();
		})

		if (controls) {
			controls.appendChild<HTMLElement>(label);
			controls.appendChild<HTMLElement>(gBTN);
		}
	}
});

addCourseBTN?.addEventListener<"click">("click", (): void => {
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
			}
		} else {
			console.log("Kurskoder måste vara unika.");
		}
	} else {
		console.log("Alla fält förutom länk är obligatoriska.");
	}

});


courseCodeINPUT?.addEventListener<"input">("input", (): void => {
	const code: string | null = getValInput("coursecode-input");

	if (code) {
		const course: Course = courseObjects.filter(course => course.getCourseInfo().code === code)[0];
		
		if (courseExists(code)) {
			courseCodeINPUT.style.backgroundColor = "red";
			if (course) {
				course.getRow().style.backgroundColor = "red";
			}
		} else {
			courseCodeINPUT.style.backgroundColor = "white";
			courseObjects.forEach(c => {
				c.getRow().style.backgroundColor = "black";
			});
		}
	} else if (code === "") {
		courseCodeINPUT.style.backgroundColor = "white";
		
	}

});

progressionINPUT?.addEventListener<"input">("input", (): void => {
	const progression: string | null = getValInput("progression-input");
	if (progression) {
		if (checkProgression(progression)) {
			progressionINPUT.style.backgroundColor = "white";
		} else {
			progressionINPUT.style.backgroundColor = "red";
		}
	} else if (progression === "") {
		progressionINPUT.style.backgroundColor = "white";
	}
})

async function getCourses(): Promise<void> {
	try {
		const resp: Response = await fetch("https://webbutveckling.miun.se/files/ramschema_ht24.json");
		const data: Array<CourseInfo> = await resp.json();
		console.log(data);
		data.forEach(d => {
			createCourse(d.code, d.coursename, d.progression, d.syllabus)
		});
	} catch (error) {
		console.error(error);
	}
}

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
 * 
 * @param code 
 * @returns 
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
 * 
 * @param progression 
 * @returns 
 */
function checkProgression(progression: string): boolean {
	return Object.values(Progression).includes(progression);
}

enum Progression { "A", "B", "C" };

interface CourseInfo {
	code: string;
	coursename: string;
	progression: string;
	syllabus?: string;
}

/**
 * 
 */
class Course {
	private ci: CourseInfo;
	private tr: HTMLElement;

	constructor(ci: CourseInfo) {
		this.ci = ci;
		this.tr = document.createElement("tr");
	}

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

	render(): void {

		if (this.ci.syllabus) {
			this.tr.title = `Öppna ${this.ci.coursename} i ny flik`;
			this.tr.addEventListener<"click">("click", (): void => {
				window.open(this.ci.syllabus, "_blank");
			});
		} else {
			this.tr.title = `${this.ci.coursename} har ingen länk`;
		}

		this.tr.innerHTML = `
      		<td>${this.ci.code}</td>
      		<td>${this.ci.coursename}</td>
      		<td>${this.ci.progression}</td>
    	`;

		if (cContainer) {
			cContainer.appendChild(this.tr);
		}
	}

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