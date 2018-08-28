import { text0 } from './test-0';
import { text1 } from './test-1';
import { text2 } from './test-2';
import './style.less';

const textJoin = (...arg) => {
    let P = document.createElement("p");
    P.innerHTML = arg.join(" ");
    document.getElementById('root').appendChild(P);
}

textJoin(text0,text1,text2);