// ***** КОНСТАНТЫ ***** 


const correctAnswers = {
    'question[0]': 4,
    'question[1]': 5,
    'question[2]': 5,
    'question[3]': 4,
    'question[4]': 3,
    'question[5]': 2,
    'question[6]': 2,
    'question[7]': 2,
    'question[8]': 'true true',
    'question[9]': [2, 3]
};
const groupExp = new RegExp('[90-3][kKкК]9[0-5][149][1-4]');


// ***** КЛАССЫ ***** 


class Answer {
    constructor(type, name, text, parent_id, answerCount) {
        this.type = type;
        this.name = name;       
        this.parent_id = parent_id;
        this.value = answerCount;
        this.text = text;
    }

    display() {
        let par_elem = document.getElementById(this.parent_id);
        let label, field;
        switch(this.type){
            case('radio'):
                label = this.createLabel(par_elem);
                this.setLabelText(label);
                field = this.createInput(label);
                this.setFieldValue(field);
                this.setRequired(field);
                this.setFieldClass(field);
                break;
            case('text'):
                field = this.createInput(par_elem);
                this.setRequired(field);
                this.setAutocomplete(field);
                break;
            case('select-one'):
                let select = document.getElementsByName(this.name)[0];
                field = this.createOption(select);
                this.setFieldValue(field);
                this.setRequired(field);
                break;
            case('checkbox'):
                label = this.createLabel(par_elem);
                this.setLabelText(label);
                this.setLabelClass(label);
                field = this.createInput(label);
                this.setFieldValue(field);
                break;
        }
    }

    // Вспомогательные функции-"кирпичики", из которых будут 
    // строиться элементы формы различных типов

    createLabel(par_elem) {
        let label = document.createElement('label');
        par_elem.append(label);
        return label;
    }

    setLabelClass(label) { label.setAttribute('class', 'form-control'); }

    setLabelText(label) { label.append(this.text); }

    createInput(par_elem) {
        let input = document.createElement('input');
        input.setAttribute('type', this.type);
        input.setAttribute('name', this.name);
        par_elem.prepend(input);
        return input;
    }

    createOption(par_elem){
        let option = document.createElement('option');
        option.innerHTML = this.text;
        par_elem.append(option);
        return option;
    }

    setFieldValue(field) { field.setAttribute('value', this.value);}

    setRequired(field) {field.setAttribute('required', true);}

    setFieldClass(field) {field.setAttribute('class', 'radio');}

    setAutocomplete(field) {field.setAttribute('autocomplete', 'off');}
}

class Question {
    static questionCount = 0;
    answerCount = 0;

    constructor(type, text) {
        this.type = type;
        this.name = `question[${Question.questionCount}]`;
        this.text = text;
        this.id = `q${Question.questionCount++}answer`;
        this.answers = [];
        this.display();
    }

    display() {
        let parent = document.getElementsByClassName("question")[0];
        let container = document.createElement('div');
        container.setAttribute('class', "print-question container-fluid");
        parent.append(container);
                
        let questionHeader = document.createElement('h5');
        questionHeader.innerHTML = this.text;
        container.append(questionHeader);

        let answersContainer = document.createElement('div');
        answersContainer.setAttribute('class', 'ansver');
        answersContainer.setAttribute('id', this.id);
        container.append(answersContainer);

        if(this.type == 'select-one') {
            let select = document.createElement('select');
            select.setAttribute('name', this.name);
            answersContainer.append(select);
        }
    }

    createAnswers() {
        if(this.type == 'text') {this.newAnswer();}
        else {Array.from(arguments).forEach(answ_text => this.newAnswer(answ_text));}
    }

    newAnswer(answ_text) {
        this.answerCount++;
        this.answers.push(new Answer(this.type, this.name, answ_text, this.id, this.answerCount));
        this.answers[this.answerCount - 1].display();
    }
}


// ***** ПОСТРОЕНИЕ СТРАНИЦ ***** 


function createResPage() {
    console.log(localStorage.getItem('questions'));
    console.log(localStorage.getItem('answers'));

    let res = document.createElement('h1');
    res.innerHTML = `Ваш результат: ${localStorage.getItem("mark")}/10`;
    let header = document.getElementsByClassName('header')[0];
    header.append(res);
  
    let questions = JSON.parse(localStorage.getItem('questions'));
    let answers = JSON.parse(localStorage.getItem('answers'));
    let results = JSON.parse(localStorage.getItem('results'));

    let questContainer = document.getElementById('questionsContainer');
    let wrong = document.createElement('div');
    let wrongAnswList = Object.entries(results).map(([key, value]) => {if(!value) return key;});
    wrongAnswList = wrongAnswList.filter(item => typeof item !== "undefined");
    wrongAnswList = wrongAnswList.map(item => {
        let qObj = questions.find(question => question.name == item);
        let refer = qObj.id;
        let str = parseInt(item.substring(9, 10)) + 1;
        return `<a href="#${refer}" class="wrongAnswRef">${str}</a>`;
    });
    wrong.innerHTML = `<p>Неправильные ответы: ${wrongAnswList.join(', ')}</p>`;
    header.after(wrong);

    questions.forEach(question => {
        let container = document.createElement('div');
        container.setAttribute('id', question.id);
        questContainer.append(container);

        let questText = document.createElement('h5');
        questText.innerHTML = question.text;
        container.append(questText);

        if(!results[question.name]) {
            let userAnswer = answers[question.name];
            if(question.type != 'text') {
                if(question.type == 'checkbox') {
                    let answObj = question.answers.filter(item => userAnswer.includes(String(item.value)));
                    answObj = answObj.map(item => item.text);
                    userAnswer = answObj.join(', ');
                }
                else {
                    let answObj = question.answers[userAnswer - 1];
                    userAnswer = answObj.text;
                }
            }
            let wrongAnsw = document.createElement('p');
            wrongAnsw.innerHTML = `<b style="color: #d36767;">Ваш ответ:</b> ${userAnswer}`;
            container.append(wrongAnsw);
        }
        let correctAnsw = document.createElement('p');
        let answ = correctAnswers[question.name];

        if(question.type != 'text') {
            if(question.type == 'checkbox') {
                let answObj = question.answers.filter(item => answ.includes(item.value));
                answObj = answObj.map(item => item.text);
                answ = answObj.join(', ');
            }
            else {
                let answObj = question.answers[answ - 1];
                answ = answObj.text;
            }
        }
        correctAnsw.innerHTML = `<b style="color: #62cb5c;">Правильный ответ:</b> ${answ}`;
        container.append(correctAnsw);
        //localStorage.clear();
    });   
}

function createMainPage() {
    let mainForm = document.getElementById('response-form');
    let container = document.createElement('div');
    container.setAttribute('class', 'question');
    mainForm.prepend(container);

    let questions = [
    new Question('radio', '1) Где можно использовать JavaScript?'),
    new Question('text', 
`2) Какое количество сообщений будет выведено в консоль?
<pre>
for(var i = 10; i &lt; 35; i += 5) {
console.log(i);
}</pre>`),
    new Question('select-one', '3) В чем отличие между локальной и глобальной переменной?'),
    new Question('radio', '4) Какая переменная записана неверно?'),
    new Question('radio', '5) В чем разница между confirm и prompt?'),
    new Question('radio', '6) Язык JavaScript является подвидом языка Java - верно?'),
    new Question('radio', `7) Что будет на экране?
<pre>
alert(str);
var str = "Hello"; </pre>`),
    new Question('radio', `
8) Что выведет этот код?
<pre>
let y = 1; 
let x = y = 2; 
alert(x);</pre>`),
    new Question('text', `
9) Что выведет этот код?
<pre>
var a = [];
console.log((a == a) + ' ' + (a != a));</pre>`),
    new Question('checkbox', '10) Выберите все корректные варианты объявления функции в javascript.')];

    questions[0].createAnswers('серверные приложения', 
    'мобильные приложения', 
    'веб-приложения', 
    'можно во всех перечисленных', 
    'прикладное программное обеспечение');

    questions[1].createAnswers();

    questions[2].createAnswers("отличий нет",
    "локальные видны повсюду, глобальные только в функциях",
    "глобальные можно переопределять, локальные нельзя",
    "локальные можно переопределять, глобальные нельзя",
    "глобальные видны повсюду, локальные только в функциях");

    questions[3].createAnswers('var num = "STRING";',
    'var isDone = 0;',
    'var b = false;',
    'var number = 12,5;');

    questions[4].createAnswers('ничем не отличаются',
    'confirm вызывает диалоговое окно с полем для ввода, prompt - окно с подтверждением',
    'prompt вызывает диалоговое окно с полем для ввода, confirm - окно с подтверждением');

    questions[5].createAnswers('да',
    'нет',
    'наоборот, Java - подвид JavaScript');

    questions[6].createAnswers('Hello',
    'undefined',
    'будет ошибка');

    questions[7].createAnswers('1',
    '2',
    'x',
    'y = 2',
    'в коде явно какая-то ошибка');

    questions[8].createAnswers();

    questions[9].createAnswers('function:MyFunction() {}',
    'function MyFunction() {}',
    'let MyFunction = function() {}',
    'function = New MyFunction()');

    localStorage.setItem('questions', JSON.stringify(questions));
    console.log(localStorage.getItem('questions'));
}


// ***** ОБРАБОТКА ФОРМ ***** 


function register() {
    let form = document.forms[0];
    let person = {};
    person.firstname = form.elements.name.value;
    person.surname = form.elements.surname.value;
    person.group = form.elements.group.value;
    if(!groupExp.test(person.group)) {
        alert('Неккоректный формат группы');
        form.elements.group.value = "";
        return false;
    }
    localStorage.setItem("person", JSON.stringify(person));
    return true;
}

function getAnswers() {
    let mark = 0, answers = {}, result = {};
    let mainForm = document.getElementById('response-form');
    let elements = Array.from(mainForm.elements);
    elements.forEach(item => {
        if((item.type == 'radio' && item.checked) || item.type == 'text' || item.type == 'select-one')
            answers[item.name] = item.value;
        else if (item.type == 'checkbox' && item.checked) {
            if (!(item.name in answers)) {
                answers[item.name] = [item.value];
            }
            else {
                answers[item.name].push(item.value);
            }
        } 
    });
    for (let key in answers) {
        result[key] = false;
        if (compare(answers[key], correctAnswers[key])) {mark++; result[key] = true;}
    }

    localStorage.setItem("mark", mark);
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("results", JSON.stringify(result));

    let person = JSON.parse(localStorage.getItem('person'));
    person.mark = mark;
    person.answers = answers;
    person.results = result;
    localStorage.setItem("person", JSON.stringify(person)); 
}

async function writeInFile() {

    const opts = {
        types: [{
          description: 'JSON file',
          accept: {'application/json': ['.json']},
        }],
      };

let data = localStorage.getItem('person');
console.log(data);

 // create a new handle
 const newHandle = await window.showSaveFilePicker(opts);

 // create a FileSystemWritableFileStream to write to
 const writableStream = await newHandle.createWritable();

 // write our file
 await writableStream.write(data);

 // close the file and write the contents to disk.
 await writableStream.close();
}

function compare(a1, a2) {
    if(Array.isArray(a1))
        return a1.length == a2.length && a1.every((v,i)=>v == a2[i]);
    else
        return a1 == a2;
}
