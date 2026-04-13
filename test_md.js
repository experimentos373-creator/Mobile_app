
function renderMD(text) {
  if (!text) return '';
  
  // Normalize
  text = text.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  const latexBlocks = [];
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { latexBlocks.push('$$' + m + '$$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
  text = text.replace(/\$([^$\n]+?)\$/g, (_, m) => { latexBlocks.push('$' + m + '$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
  
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  text = text.replace(/^### (.+)$/gm, '<h3 class="H3">$1</h3>');
  
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // Paragraphs
  let result = '';
  const paras = text.split(/\n\n+/);
  paras.forEach(p => {
    let pContent = p.trim().replace(/\n/g, '<br>');
    if (pContent) {
      if (pContent.startsWith('<h3')) {
        result += pContent;
      } else {
        result += `<p>${pContent}</p>`;
      }
    }
  });
  
  result = result.replace(/\x00LATEX(\d+)\x00/g, (_, i) => latexBlocks[i]);
  return result;
}

const input = "### Título\n**Tema:** Estequiometria\n\nFinal.";
console.log(renderMD(input));
