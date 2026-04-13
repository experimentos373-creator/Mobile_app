const fs = require('fs');
    function renderMD(text) {
      if (!text) return '';
      text = text.replace(/\\n/g, '\n');
      
      const latexBlocks = [];
      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { latexBlocks.push('$$' + m + '$$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      text = text.replace(/\$([^$\n]+?)\$/g, (_, m) => { latexBlocks.push('$' + m + '$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      text = text.replace(/^### (.*$)/gim, '\x01H3\x02$1\x03')
                 .replace(/^## (.*$)/gim, '\x01H2\x02$1\x03')
                 .replace(/^# (.*$)/gim, '\x01H1\x02$1\x03');
                 
      text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
      text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>');
      text = text.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 rounded text-emerald-300">$1</code>');
      
      // ... Tables ...
                 
      let htmlOutput = '';
      const lines = text.split('\n\n');
      lines.forEach(line => {
        let trimmed = line.trim();
        if (!trimmed) return;
        
        if (trimmed.startsWith('\x01')) {
          htmlOutput += trimmed;
        } else {
          // Fix single newlines inside paragraph flowing
          let pContent = trimmed.replace(/\n\s*/g, ' '); 
          // Wait, if it's "(\n$22,05$\n)", the replace makes it "( $22,05$ )".
          // If the previous character was '(' and the next is not space, maybe we remove space?
          htmlOutput += `<p class="test">${pContent}</p>`;
        }
      });
      return htmlOutput.replace(/\x01H3\x02(.*?)\x03/g, '<h3>$1</h3>');
    }

console.log(renderMD('A é:\n2020'));
console.log(renderMD('o valor de x (\n22,05\n)'));
