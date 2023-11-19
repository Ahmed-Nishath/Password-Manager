const form=document.querySelector('form');
var accounts = undefined;
const passwordLength = 14;

fetch("./Source/accounts.json")
  .then(res => res.json())
  .then(json => {
    accounts = json;
});

const phrase=document.getElementById('phrase');
const pvv=document.getElementById('pvv');

const darkButton = document.getElementById("dark-button");

function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}

darkButton.addEventListener("click", () => {
    darkButton.classList.toggle('clicked');
})

form.addEventListener('submit', event =>{
    validateInputs();
    if(isValidForm() == true){ 
        event.preventDefault(); 
        encrypt(phrase.value, pvv.value);    
    }
    else{
        event.preventDefault();
    }
});


function validateInputs(){
    if(phrase.value==null || phrase.value.trim() ===''){
        setError(phrase, '*phrase is required');
    }
    else if(phrase.value.trim().length<8) {
        setError(phrase, '*phrase is too short');
    }
    else{
        setSuccess(phrase);
    }

    if(pvv.value==null || pvv.value.trim() ===''){
        setError(pvv, '*pvv number is required');
    }
    else{
        if(!isNaN(pvv.value.trim()) &&  pvv.value.trim().length==3 && pvv.value.trim()>0 && !pvv.value.trim().toString().includes('0')){
            setSuccess(pvv);
        }
        else{
            setError(pvv, 'pvv is invalid');
        }
    }
}


function isValidForm(){
    const inputContainers=form.querySelectorAll('li');
    let result=true;
    inputContainers.forEach((container) =>{
        if(container.classList.contains('error')){
            result=false;
        }
    });
    return result;
}


const setError = (element, msg) =>{
    const inputs=element.parentElement;
    const errDisplay=inputs.querySelector('.error');

    errDisplay.innerText=msg;
    inputs.classList.add('error');
    inputs.classList.remove('success');
}


const setSuccess = element =>{
    const inputs=element.parentElement;
    const errDisplay=inputs.querySelector('.error');

    errDisplay.innerText='';
    inputs.classList.remove('error');
}


function addDigits(number) {
    var result = 0;
    var numArr = String(number).split("").map((number)=>{ 
        return Number(number) 
    }) 

    for (let i = 1; i <= numArr.length; i++) {
            result += Math.pow(numArr[i-1], i+1) + 3*i;
    }
    return result;
}

const writeList =(generatedPasswords) =>{
    var genList = '';
    var keys = [];
    var i=0;
    for(var k in accounts) {
        genList += '<div><div class = "single-account"><div class="account-heading">'+ k +'</div>';

        for (let j = 0; j < accounts[k].length; j++) {
            genList += '<div class=password-blocks><div class="userName-container"><div class="userName" id="a'+i+'n">'+ accounts[k][j] +'</div><button id="a'+i+'n" onclick="copyText(this.id)"><img src="./Source/Images/copy.png" alt="copy"></button></div><div class="password-container"><div class="Password" id="a'+i+'p">' +generatedPasswords[i] + '</div><button id="a'+i+'p" onclick="showPassword(this.id)"><img src="./Source/Images/show.png" alt="show"></button><button id="a'+i+'p" onclick="copyText(this.id)"><img src="./Source/Images/copy.png" alt="copy"></button></div></div>';
            ++i;
        }
        genList += '</div></div>';
    }
    document.getElementById('Password-container').innerHTML = genList;
}

const asciiConvert = (x1, x2, number) => {
    var diffRangee = x2 - x1 + 1;
    number = number % x2;
    var adder = Math.trunc(((x2-number) / diffRangee)) * diffRangee;
    return (number + adder);
}

const fixLenth = (phrase, slength, isString) => {
    var multiplyFactor = Math.trunc(slength / phrase.length);
    var fixedPassword = phrase;

    for (let i = 1; i <= multiplyFactor; i++) {
        var newStr = "";
        for(let j=1; j<=phrase.length; j++){
            if(isString) {
            newStr +=  String.fromCharCode(asciiConvert(97, 122, (phrase.charCodeAt(j-1) * (i*7+j))));
            }
            else {
            newStr +=  parseInt(phrase.charAt(j-1)) * (i*7+j);
            }
        }
        fixedPassword += newStr;
    }
    return fixedPassword.substring(0,slength);
}

// function getRandomNumbers(seed, min, max) {
//     const length = max - min;
//     const shuffledArray = Array.from({ length }, (_, i) => i + min);
  
//     for (let i = length - 1; i > 0; i--) {
//         seed = (seed * 1103515245 + 12345) % 2147483648; // Linear Congruential Generator
//         const j = Math.floor(seed % (i + 1));
//         [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
//     }
  
//     return shuffledArray;
//   }

const encrypt = (phrase, pvv) => {
    if(phrase.length > passwordLength){
        phrase = phrase.substring(0,passwordLength);
    }
    else if(phrase.length < passwordLength){
        phrase = fixLenth(phrase, passwordLength, true);
    }

    asciiKeys = [];
    for (let i = 0; i < passwordLength; i++) {
        asciiKeys.push(phrase.charCodeAt(i));
    }

    var multipliedResult = addDigits(pvv);
    var shifter = Math.pow(multipliedResult, 5);
    shifter = parseInt(fixLenth(shifter.toString(), passwordLength, false));

    // indexes = getRandomNumbers(pvv, 0, passwordLength);

    serialcode = "";
    for (let i = 1; i <= passwordLength; i++) {
        var j = asciiKeys[i-1];  
        var temp = (shifter*i+j);
        serialcode += temp;
    }    
    
    var accLength = 0;
    for(k in accounts){
        accLength+=accounts[k].length;
    }

    serialcode = fixLenth(serialcode, accLength*passwordLength, false);

    var generatedPasswords = [];
    var x1, x2, y=0;
    for(let i = 0; i < accLength; i++){
        var passwordSingle = "";
        for (let j = 0; j < passwordLength; j++) {
            passChar = asciiKeys[j]+parseInt(serialcode.charAt(y))*17;
            if(j==0 || j==4 || j==8 || j==12){
                x1 = 65; x2 = 90;
            }
            else if(j==1){
                x1 = 33; x2 = 47;
            }
            else if(j==5){
                x1 = 58; x2 = 64;
            }
            else if(j==9){
                x1 = 91; x2 = 96;
            }
            else if(j==2 || j==6 || j==10){
                x1 = 48; x2 = 57;
            }
            else if(j==3 || j==7 || j==11 || j==13){
                x1 = 97; x2 = 122;
            }
            passwordSingle += String.fromCharCode(asciiConvert(x1, x2, passChar));
            y++;
        }
        generatedPasswords.push(passwordSingle);
    }
    writeList(generatedPasswords);
}
