/**
 * Markdown rendering and MathJax bootstrap extracted from index.html
 * for CSP hardening.
 */

// Improved Markdown Parser with Table Support
    window.renderMD = function(text) {
      if (!text) return '';
      
      // Step 0: normalize literal \n strings to real newlines
      text = text.replace(/\\n/g, '\n');
      
      // Step 1: protect LaTeX blocks
      const latexBlocks = [];
      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { latexBlocks.push('$$' + m + '$$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      text = text.replace(/\$([^$\n]+?)\$/g, (_, m) => { latexBlocks.push('$' + m + '$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      
      // Step 2: HTML entities
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Step 3: Markdown formatting
      // Headings
      text = text.replace(/^### (.+)$/gm, '\x01H3\x02$1\x03');
      text = text.replace(/^## (.+)$/gm, '\x01H2\x02$1\x03');
      text = text.replace(/^# (.+)$/gm, '\x01H1\x02$1\x03');
      
      // Lists - capture entire list blocks
      text = text.replace(/(?:^[\*\-] .+(\r?\n|$))+/gm, (match) => {
        const items = match.trim().split(/\n/).map(li => li.replace(/^[\*\-] /, ''));
        return '\x01UL\x02' + items.join('\x04') + '\x03';
      });
      
      // Tables - handle AI-generated tables with varying spacing and leading/trailing whitespace
      const tableRegex = /(?:^[ \t]*\|.+\|[ \t]*\r?\n(?:^[ \t]*\|[-: ]+\|[ \t]*\r?\n)?(?:^[ \t]*\|.+\|[ \t]*(?:\r?\n|$))+)/gm;
      text = text.replace(tableRegex, (match) => {
        const lines = match.trim().split(/\n/).filter(r => r.trim().startsWith('|') && r.trim().endsWith('|'));
        const bodyContent = lines.map((row, idx) => {
          if (idx === 1 && row.includes('---')) return '';
          const cells = row.split('|').filter((c, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
          return cells.join('\x04');
        }).filter(r => r).join('\x05');
        return '\x01TABLE\x02' + bodyContent + '\x03';
      });

      // Horizontal Rule
      text = text.replace(/^---+$/gm, '\x01HR\x02\x03');
      
      // Pre-process: fix AI table quirks (e.g. using 'I' instead of '|')
      // Only do this if the line looks like a table row: starts and ends with I or |
      text = text.replace(/^[ \t]*I(.+?)I[ \t]*$/gm, (_, content) => `|${content.replace(/I/g, '|')}|`);
      text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
      text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>');

      // Elite Edu-Card Pedagogical Sections
      text = text.replace(/(?:^|\n)(?:[???????]*\s*)?(Contextualização|Resumo de Dados|Dados e Parâmetros|Dados|Contexto)(?::)?/gi, '\n<div class="flex items-center gap-2 mb-2 mt-6"><span class="px-2.5 py-1 bg-blue-500/10 text-blue-400 font-black text-[10px] uppercase tracking-wider rounded-lg border border-blue-500/20 shadow-lg shadow-blue-500/5">?? $1</span></div>');
      text = text.replace(/(?:^|\n)(?:[???????]*\s*)?(O Comando|Comando|Pergunta|Objetivo)(?::)?/gi, '\n<div class="flex items-center gap-2 mb-2 mt-6"><span class="px-2.5 py-1 bg-rose-500/10 text-rose-400 font-black text-[10px] uppercase tracking-wider rounded-lg border border-rose-500/20 shadow-lg shadow-rose-500/5">?? $1</span></div>');
      text = text.replace(/(?:^|\n)(?:[????????]*\s*)?(Fundamentação e Fórmulas|Fundamentação|Teoria|Fórmulas)(?::)?/gi, '\n<div class="flex items-center gap-2 mb-2 mt-6"><span class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-black text-[10px] uppercase tracking-wider rounded-lg border border-indigo-500/20 shadow-lg shadow-indigo-500/5">?? $1</span></div>');
      text = text.replace(/(?:^|\n)(?:[???????]*\s*)?(Resolução Integrada|Resolução|Passo a Passo|Resposta)(?::)?/gi, '\n<div class="flex items-center gap-2 mb-2 mt-6"><span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-black text-[10px] uppercase tracking-wider rounded-lg border border-emerald-500/20 shadow-lg shadow-emerald-500/5">?? $1</span></div>');
      
      // Code blocks
      text = text.replace(/```([\s\S]*?)```/g, '\x01PRE\x02$1\x03');
      text = text.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">$1</code>');
      
      // Step 4: Paragraphs and Reconstruction
      let htmlOutput = '';
      // Improved splitting: split by double newline but handle cases where blocks are mixed with text
      const parts = text.split(/\n\n/);
      parts.forEach(part => {
        let trimmed = part.trim();
        if (!trimmed) return;
        
        // If it starts with a marker, it's a block
        if (trimmed.startsWith('\x01')) {
          htmlOutput += trimmed;
        } else {
          // If a table or other block is INSIDE a paragraph (due to single \n), pull it out
          if (trimmed.includes('\x01')) {
            // This is a complex case, we'll just handle it by reconstruction
            let subParts = trimmed.split(/(\x01[\s\S]+?\x03)/);
            subParts.forEach(sp => {
                if (sp.startsWith('\x01')) {
                    htmlOutput += sp;
                } else {
                    let pContent = sp.trim().replace(/\n/g, '<br>');
                    if (pContent) htmlOutput += `<div class="mb-4 text-white/90 leading-relaxed text-sm">${pContent}</div>`;
                }
            });
          } else {
            let pContent = trimmed.replace(/\n/g, '<br>');
            htmlOutput += `<div class="mb-4 text-white/90 leading-relaxed text-sm">${pContent}</div>`;
          }
        }
      });

      // Final transformation of markers to real HTML
      htmlOutput = htmlOutput
        .replace(/\x01H3\x02(.+?)\x03/g, '<h3 class="text-base font-black text-emerald-400 mt-4 mb-2">$1</h3>')
        .replace(/\x01H2\x02(.+?)\x03/g, '<h2 class="text-lg font-black text-white mt-5 mb-3">$1</h2>')
        .replace(/\x01H1\x02(.+?)\x03/g, '<h1 class="text-xl font-black text-white mt-6 mb-4">$1</h1>')
        .replace(/\x01UL\x02(.+?)\x03/g, (_, items) => {
          const listHtml = items.split('\x04').map(it => `<li class="ml-4 list-disc text-white/90">${it}</li>`).join('');
          return `<ul class="mb-4 space-y-1">${listHtml}</ul>`;
        })
        .replace(/\x01TABLE\x02(.+?)\x03/g, (_, rows) => {
          let tableHtml = '<div class="overflow-x-auto my-4 shadow-xl rounded-xl border border-white/5 bg-slate-900/40"><table class="w-full text-xs border-collapse text-white/80 overflow-hidden">';
          rows.split('\x05').forEach((row, idx) => {
            const cells = row.split('\x04');
            const isHeader = idx === 0;
            const tag = isHeader ? 'th' : 'td';
            const bg = isHeader ? 'bg-slate-800/80 font-black text-white border-b border-white/10' : 'border-t border-white/5';
            tableHtml += '<tr>' + cells.map(c => `<${tag} class="px-4 py-3 ${bg} text-left truncate max-w-[150px]">${c}</${tag}>`).join('') + '</tr>';
          });
          tableHtml += '</table></div>';
          return tableHtml;
        })
        .replace(/\x01PRE\x02([\s\S]+?)\x03/g, '<pre class="bg-slate-900 rounded p-4 my-2 overflow-x-auto text-[10px] border border-white/10"><code>$1</code></pre>')
        .replace(/\x01HR\x02\x03/g, '<hr class="border-white/20 my-4">');

      // Step 5: restore LaTeX
      htmlOutput = htmlOutput.replace(/\x00LATEX(\d+)\x00/g, (_, i) => latexBlocks[i]);
      
      return window.Security ? Security.sanitizeRichHTML(htmlOutput) : htmlOutput;
    }
    window.renderMDInline = function(text) {
      if (!text) return '';
      text = text.replace(/\\n/g, '\n');
      const latexBlocks = [];
      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { latexBlocks.push('$$' + m + '$$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      text = text.replace(/\$([^$\n]+)\$/g, (_, m) => { latexBlocks.push('$' + m + '$'); return '\x00LATEX' + (latexBlocks.length-1) + '\x00'; });
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      text = text
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/_([^_\n]+)_/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, ' '); 
      text = text.replace(/\x00LATEX(\d+)\x00/g, (_, i) => latexBlocks[i]);
      return window.Security ? Security.sanitizeRichInlineHTML(text) : text;
    }

    window.typesetMath = function(el) {
      if (!el) return;
      
      // Lazy load MathJax script
      if (!document.getElementById('MathJax-script')) {
        const script = document.createElement('script');
        script.id = 'MathJax-script';
        script.src = 'js/vendor/mathjax.js';
        script.async = true;
        document.head.appendChild(script);
      }

      // Enhanced retry logic for MathJax initialization
      const tryTypeset = (count = 0) => {
        if (window.MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise([el]).catch(err => {
            console.warn('MathJax error:', err);
            if (count < 2) setTimeout(() => tryTypeset(count + 1), 300);
          });
        } else if (count < 5) {
          // Wait longer if MathJax script is still loading
          setTimeout(() => tryTypeset(count + 1), 500);
        }
      };
      
      // Delay to ensure DOM is absolutely ready
      setTimeout(tryTypeset, 200);
    }

window.MathJax = {
      tex: { 
        inlineMath: [['$', '$'], ['\\(', '\\)']], 
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
      },
      options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      svg: { fontCache: 'global' },
      startup: { 
        typeset: false
      }
    };