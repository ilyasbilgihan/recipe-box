export const editorCSS = `@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap'); 
p{word-break: break-word; text-wrap: balance; }
body.light{background-color: #FAF9FB; color: rgb(42 48 81)}
body.dark{background-color: rgb(40 44 61); color: #FAF9FB}
*{
font-family: "Quicksand", sans-serif;
font-optical-sizing: auto;
font-weight: <weight>;
} 
ul{list-style: none} li[data-type]{display: flex; gap: 2px} blockquote { border-left: 4px solid #ccc; padding: 1em 10px;} p, h1, h2, h3, h4, h5, h6 { padding: 0 16px; } :is(ul, ol) li p {padding: 0; margin: 0} ul[data-type]{ padding: 0 28px} blockquote { padding: 0; }`;
