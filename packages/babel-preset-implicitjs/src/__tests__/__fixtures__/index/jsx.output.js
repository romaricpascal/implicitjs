import articleBody from './articleBody';

export default function template(data) {
  return data.tag`<article class="${data.classes}">
    <h1>${data.title}</h1>
    ${articleBody()}
    </article>`;
}
