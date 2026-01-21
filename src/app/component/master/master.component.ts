import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { MyServiceService } from 'src/app/my-service.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent {
  selectRatio = false;
  pagenumber = '';
  jobid: any;
  isCollapsed = false;
  isCollapse = false;
  editorContent: string = "";
  contentDiv: string = "editor-container";
  issresult = false;
  fullword = " ";
  myElement: HTMLElement | null = null;
  mytext: string | null = null;
  a = true;
  isLineMode: boolean = false;
  isParaMode: boolean = false;
  selectedPara: HTMLElement | null = null;
  currentpagenumber: number = 0;
  // private charOffset = 0;

  isfirst = true

  constructor(private service: MyServiceService, private api: ApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.togglebar();
    this.lineMode();
    this.paraMode();
    this.routeService();
    this.editorMainPage();
    this.pdfmeasure();
    this.updatepdf();
    this.checkpoint();
    this.balword();
    this.doubleword();
    this.next();
    this.listenFirstCharPreviousLine();
    this.listenFontSize();
    this.deletePara();
    // this.indentationPlusMinas();
  }

  ngAfterViewInit() {
    document.addEventListener('click', (e) => {
      if (this.isParaMode) {
        this.selectFullPara(e);
        // return;
      }
      if (this.isLineMode) {
        this.selectFullLine(e);
        return;
      } else {
        this.onWordSelect(e);
      }
    }, true);
    this.disableWordClick();
    this.paraaboove();
    this.parabelow();
    this.ParaMoveAction();
    this.listenParaAlignment();
    // this.listenParaList();
    this.listenLetterSpace();
    this.listenWordSpace();
    this.listenIndent();
  }
  lineMode() {
    this.service.lineMode$.subscribe(mode => {
      this.isLineMode = mode;
    });
  }
  paraMode() {
    this.service.paraMode$.subscribe(para => {
      this.isParaMode = para;
    });
  }
  routeService() {
    this.route.queryParamMap.subscribe((data) => {
      this.jobid = data.get('jobid');
    })
  }
  disableWordClick() {
    document.querySelectorAll('word').forEach(w => {
      w.addEventListener('click', e => {

        if (this.isParaMode) return;

        e.stopPropagation();
        e.preventDefault();
      });
    });
  }

  togglebar() {
    this.service.sidebarmenu$.subscribe(data => {
      this.isCollapsed = data
    })
  }
  editorMainPage() {
    let requestobject = {
      "JobId": this.jobid,
      "status": "token"
    }
    this.api.mainContent(requestobject).subscribe(response => {
      this.loadHTMLFile(response);
    })

  }
  loadHTMLFile(response: any) {

    if (response) {
      let modified = String(response).replace(
        /\[data-icodex-viewer-viewport\]\s*\{\s*background:\s*#[0-9a-fA-F]{3,6}/,
        '[data-icodex-viewer-viewport] { background: none'
      );
      this.editorContent = modified;
    }
    var container = document.getElementById(this.contentDiv);
    if (container) {
      container.innerHTML = this.editorContent;
      this.CorrectHTMl();
      this.wrapTextNodesInWordTags(container);
    }
    var containerpdf = document.getElementById('icodex-viewer-viewport') as HTMLInputElement;
    containerpdf.style.setProperty('zoom', '100%');
    setTimeout(() => {
      this.pdfmeasure();
    }, 100);
  }

  CorrectHTMl() {
    const divContent = document.querySelector('.content') as HTMLDivElement;
    divContent.innerHTML = this.editorContent;
    this.avoidLineSpanning2Lines(divContent);
  }

  avoidLineSpanning2Lines(para: HTMLElement) {
    const lines = para.querySelectorAll("[name='broken']") as NodeListOf<HTMLElement>;
    for (let n = 0; n < lines.length; n++) {
      const currentLine = lines[n];
      let firstnode = currentLine.firstElementChild as HTMLElement;
      if (firstnode != null && firstnode.nodeName === 'A') {
        firstnode = firstnode.nextElementSibling as HTMLElement;
      }
      const lastnode = currentLine.lastElementChild as HTMLElement;
      let _spacing = 0;
      try {
        while (lastnode.getBoundingClientRect().top > firstnode.getBoundingClientRect().top + 2) {
          _spacing = _spacing - 0.1;
          var parentDiv = currentLine.parentElement as HTMLElement;
          if (parentDiv.className == 'affiliation' || parentDiv.className == 'corresp') {
            break;
          }
          currentLine.style.wordSpacing = _spacing + 'pt';
          if (_spacing < -3) {
            currentLine.style.wordSpacing = '0pt';
            break;
          }
        }
      } catch { }
      try {
        while (
          lastnode.nodeName !== 'IMG' &&
          lastnode.getBoundingClientRect().height >
          firstnode.getBoundingClientRect().height + 2
        ) {
          _spacing = _spacing - 0.1;
          var parentDiv = currentLine.parentElement as HTMLElement;
          if (parentDiv.className == 'affiliation') {
            break;
          }
          currentLine.style.wordSpacing = _spacing + 'pt';
          if (_spacing < -3) {
            currentLine.style.wordSpacing = '0pt';
            break;
          }
        }
      } catch { }
    }
  }
  wrapTextNodesInWordTags(parent: HTMLElement) {
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);

    const nodes: Text[] = [];

    let node: any;
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue;
      if (node.parentElement?.tagName.toLowerCase() === "word") continue;

      nodes.push(node);
    }

    nodes.forEach(t => {
      const wrap = document.createElement("word");
      wrap.textContent = t.textContent;
      t.parentNode?.replaceChild(wrap, t);
    });
  }

  pdfmeasure() {
    const pages = document.querySelectorAll('[data-icodex-page-container]');

    const results: any[] = [];

    pages.forEach((page: any, index: number) => {

      const pageNumber = index + 1;

      const mainBody = page.querySelector('[data-icodex-type="mainBodyPage"]') as HTMLElement;


      const pageBox = page.getBoundingClientRect();
      const textBox = mainBody?.getBoundingClientRect();

      const styles = mainBody ? getComputedStyle(mainBody) : null;

      results.push({
        pageNumber,
        pageSize: {
          width: pageBox.width,
          height: pageBox.height
        },
        textBlock: {
          width: textBox?.width || 0,
          height: textBox?.height || 0
        },
        margins: mainBody
          ? {
            top: parseFloat(styles!.marginTop),
            right: parseFloat(styles!.marginRight),
            bottom: parseFloat(styles!.marginBottom),
            left: parseFloat(styles!.marginLeft)
          }
          : null
      });
    });

    this.service.sendValueFrompdf(results);

  }

  onWordSelect(event: MouseEvent) {
    this.clearSelectedLines();

    if (!this.service.enableWordSelection) return;

    let element = event.target as HTMLElement;
    if (!element) return;

    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentNode as HTMLElement;
    }
    const wordElement = element.closest('word') as HTMLElement | null;
    if (!wordElement) return;



    let currId = wordElement.getAttribute("wordid");
    if (!currId) {
      currId = "temp-" + Date.now();
      wordElement.setAttribute("wordid", currId);

    }
    const selectedWord = this.wordhighlighted(currId);

    wordElement.setAttribute("data-selected", "true");

    const hyWords = document.querySelectorAll(`word[wordid="${currId}"]`);
    hyWords.forEach(w => w.setAttribute("data-selected", "true"));

    this.fullword = "";
    const parts = selectedWord?.querySelectorAll("w") || [];
    parts.forEach(w =>
      this.fullword += w.textContent?.trim() || ""

    );
    this.issresult = !this.hasnext(wordElement);
    this.service.sendValueFromRadio(this.issresult);


    const a = this.hassibling?.(selectedWord!);
    if (a) {
      const hyphenation = selectedWord?.getAttribute('data-hyphenated') || "";
      this.service.sendValueFrommastercomponent(hyphenation);

      this.service.updateHyphenation({
        hyphenation: hyphenation,
        isArticleTitle: element.classList.contains('article-title')
      });
    }
    else {
      if (!selectedWord) return;
      const contentInside = selectedWord.textContent?.trim() || "";
      this.service.sendValueFrommastercomponent(contentInside);

      this.service.updateHyphenation({
        hyphenation: contentInside,
        isArticleTitle: element.classList.contains('article-title')
      });

    }
  }
  hassibling(selectword: HTMLElement): boolean {

    if (selectword.children.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  double = true;
  wordhighlighted(currId: string): HTMLElement | null {

    const hyWords = document.querySelectorAll(`word[wordid="${currId}"]`);
    if (hyWords.length === 0) return null;

    this.clearHighlightedWords();

    const currWord = hyWords[0] as HTMLElement;
    currWord.style.backgroundColor = 'rgb(255, 211, 196)';

    this.myElement = currWord;

    if (hyWords.length > 1) {
      const nextWord = hyWords[1] as HTMLElement;
      nextWord.style.backgroundColor = 'rgb(255, 211, 196)';
      return nextWord;
    }

    return currWord;
  }
  doubleword() {

    this.service.doublewordinpdf$.subscribe(data => {
      if (!this.myElement) {
        return;
      }
      this.double = this.deleteMethod(this.myElement);
    });

  }

  clearHighlightedWords() {
    const words = document.querySelectorAll("word");
    words.forEach(w => {
      (w as HTMLElement).style.backgroundColor = "";
      w.removeAttribute("data-selected");
    });
  }

  hasnext(wordElement: HTMLElement): boolean {
    const a = wordElement.textContent;
    const next = wordElement.nextElementSibling as HTMLElement | null;
    this.myElement = wordElement;
    return next !== null && next.tagName.toLowerCase() === 'word';
  }
  parentbinding(word: HTMLElement, secondpart: string | null) {
    const parentDiv = word.parentElement;
    const nextSibling = parentDiv?.nextElementSibling as HTMLElement | null;
    if (nextSibling) {
      const newElement = document.createElement('word');
      newElement.textContent = secondpart;

      newElement.style.backgroundColor = 'rgb(255, 211, 196)';
      // newElement.style.marginRight = '5px';

      newElement.setAttribute('data-selected', 'true');
      nextSibling.insertBefore(newElement, nextSibling.firstChild);

    }
  }

  deleteMethod(myElement: HTMLElement): boolean {
    const parentDiv = myElement.parentElement;
    const nextSibling = parentDiv?.nextElementSibling as HTMLElement | null;
    nextSibling?.firstElementChild?.remove();
    return true;
  }
  deletewhenfullword(myelemet: HTMLElement) {
    const parentDiv = myelemet.parentElement;
    const nextSibling = parentDiv?.nextElementSibling as HTMLElement | null;
    nextSibling?.firstElementChild?.remove();
  }
  updatepdf() {
    this.service.selectedHyphenOption$.subscribe(option => {
      if (option) {
        this.applyHyphenToSelectedWord(option);
      }
    });
  }

  applyHyphenToSelectedWord(option: string) {
    const selectedWord = document.querySelector('[data-selected="true"]') as HTMLElement;
    if (!selectedWord) return;

    const wordId = selectedWord.getAttribute("wordid") || "temp-" + Date.now();
    const fullWord = selectedWord.getAttribute('data-hyphenated')?.replace(/~/g, '') || selectedWord.textContent?.trim() || "";
    selectedWord.innerHTML = "";

    if (option === "No break") {
      const w = document.createElement("w");
      w.textContent = fullWord;
      selectedWord.appendChild(w);
      selectedWord.setAttribute("wordid", wordId);
      return;
    }

    const hyphenParts = option.split(" - ").map(p => p.trim());
    hyphenParts.forEach(part => {
      if (!part) return;
      const w = document.createElement("w");
      w.textContent = part;
      selectedWord.appendChild(w);
    });

    selectedWord.setAttribute("wordid", wordId);
  }
  checkpoint() {
    this.service.Insertvalueincheckpoint$.subscribe(data => {

      if (data) {
        if (this.myElement) {
          this.parentbinding(this.myElement, this.mytext);
        }

      }
      else {
        if (this.myElement) {
          this.a = this.deleteMethod(this.myElement!);
          if (this.a) {
            this.parentbinding(this.myElement, this.mytext);
          }
        }
      }

    });

  }

  balword() {
    this.service.currentHyphenText$.subscribe(word => {
      if (word) {
        this.mytext = word;

      } else {
        this.mytext = word;
      }
    });


  }

  // line selector
  selectFullLine(event: MouseEvent) {
    if (!this.isLineMode) return;

    const target = event.target as HTMLElement;
    const lineDiv = target.closest('div[name="broken"]') as HTMLElement;
    if (lineDiv !== null) {
      this.isfirst = true;
    }

    if (!lineDiv) return;

    this.clearSelectedLines();
    this.applyLineSelection(lineDiv);
    this.clearHighlightedWords();
    // this.charOffset = 0;

  }


  checkAndMoveIfLastLine(line: HTMLElement) {
    const currentPage = this.getPageFromLine(line);
    if (!currentPage) return;

    const lines = Array.from(
      currentPage.querySelectorAll('div[name="broken"]')
    ) as HTMLElement[];

    if (lines[lines.length - 1] === line) {
      this.moveLineToNextPageFirstLine(line);
    }
  }

  moveLineToNextPageFirstLine(line: HTMLElement) {
    const pages = this.getAllPages();
    if (!pages.length) return;

    const currentPage = this.getPageFromLine(line);
    if (!currentPage) return;

    const pageIndex = pages.indexOf(currentPage);

    if (pageIndex === -1 || pageIndex === pages.length - 1) {
      return;
    }

    const nextPage = pages[pageIndex + 1];

    const firstNextLine = nextPage.querySelector(
      'div[name="broken"]'
    ) as HTMLElement;

    if (!firstNextLine) {
      return;
    }

    const targetContainer = firstNextLine.parentElement as HTMLElement;
    targetContainer.insertBefore(line, firstNextLine);

    this.clearSelectedLines();
    this.applyLineSelection(line);

    setTimeout(() => {
      this.pdfmeasure();
    }, 50);
  }

  clearSelectedLines() {
    document
      .querySelectorAll('div[name="broken"].selected-line')
      .forEach(el => {
        el.classList.remove('selected-line');
        (el as HTMLElement).style.backgroundColor = '';
      });
  }

  applyLineSelection(lineDiv: HTMLElement) {
    lineDiv.classList.add('selected-line');
    lineDiv.style.backgroundColor = 'rgb(255, 211, 196)';
  }
  next() {
    this.service.lineAction$.subscribe((data) => {
      if (!data) return;
      this.navigateLine(data);

    })
  }

  getAllPages(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll('[data-icodex-page-container]')
    ) as HTMLElement[];
  }
  getPageFromLine(line: HTMLElement): HTMLElement | null {
    return line.closest('[data-icodex-page-container]') as HTMLElement;
  }

  isInsideIndentHyphenate(line: HTMLElement): boolean {
    const para = line.closest('.hyphenate');
    return !!para && para.classList.contains('indent');
  }
  isInsideListItemLabel(line: HTMLElement): boolean {
    return (
      !!line.closest('.listitemlabel') ||
      !!line.closest('.reflistrow')
    );
  }
  isFirstBrokenInListItem(line: HTMLElement): boolean {
    const listItem = line.closest('.listitem');
    if (!listItem) return false;

    const content = listItem.querySelector('.listitemcontent');
    if (!content) return false;

    const brokenLines = Array.from(
      content.querySelectorAll('div[name="broken"]')
    ) as HTMLElement[];

    return brokenLines[0] === line;
  }

  navigateLine(direction: 'next' | 'previous') {

    const selectedLine = document.querySelector(
      'div[name="broken"].selected-line'
    ) as HTMLElement;
    if (!selectedLine) return;

    if (this.isInsideListItemLabel(selectedLine)) {
      return;
    }

    const currentPage = this.getPageFromLine(selectedLine);
    if (!currentPage) return;

    const lines = Array.from(
      currentPage.querySelectorAll('div[name="broken"]')
    ) as HTMLElement[];

    const selectedIndex = lines.findIndex(l =>
      l.isSameNode(selectedLine)
    );

    if (direction === 'next') {
      if (selectedIndex === lines.length - 1) {
        this.moveLineToNextPageFirstLine(selectedLine);
      }

      return;

    }

    if (direction === 'previous') {
      if (this.isFirstBrokenInListItem(selectedLine)) {
        return;
      }

      if (this.isInsideIndentHyphenate(selectedLine)) {
        return;
      }

      if (selectedIndex === 0) {
        this.moveLineToPreviousPageLastLine(selectedLine);
      }
      return;
    }
  }


  moveLineToPreviousPageLastLine(line: HTMLElement) {
    const pages = this.getAllPages();
    const currentPage = this.getPageFromLine(line);
    if (!currentPage) return;

    const pageIndex = pages.indexOf(currentPage);
    if (pageIndex <= 0) return;

    const previousPage = pages[pageIndex - 1];
    const prevLines = previousPage.querySelectorAll('div[name="broken"]');

    const lastPrevLine = prevLines[prevLines.length - 1] as HTMLElement;

    lastPrevLine
      ? lastPrevLine.after(line)
      : previousPage.appendChild(line);

    this.clearSelectedLines();
    this.applyLineSelection(line);

    setTimeout(() => this.pdfmeasure(), 50);
  }

  listenFirstCharPreviousLine() {
    this.service.lineCharAction$.subscribe(action => {
      if (action === 'firstCharPrevLine') {
        this.moveCharToPreviousLine();
      }
      else if (action === 'lastCharNextLine') {
        this.moveCharToNextLine();
      }
    });
  }
  normalizeLineToLetters(line: HTMLElement) {
    const words = Array.from(line.querySelectorAll('word'));

    words.forEach(word => {
      const wTags = Array.from(word.querySelectorAll('w'));

      if (wTags.length > 1 && wTags.every(w => w.textContent?.length === 1)) {
        return;
      }

      const fullText = word.textContent || '';
      word.innerHTML = '';

      fullText.split('').forEach(ch => {
        const w = document.createElement('w');
        w.textContent = ch;
        word.appendChild(w);
      });
    });
  }


  getSelectedLine(): HTMLElement | null {
    return document.querySelector(
      'div[name="broken"].selected-line'
    ) as HTMLElement;
  }

  getSiblingLine(
    line: HTMLElement,
    direction: 'prev' | 'next'
  ): HTMLElement | null {
    const sibling =
      direction === 'prev'
        ? line.previousElementSibling
        : line.nextElementSibling;
    if (!sibling || sibling.getAttribute('name') !== 'broken') return null;
    return sibling as HTMLElement;
  }

  removeFirstChar(line: HTMLElement): { char: string | null; needSpace: boolean } | null {
    this.normalizeLineToLetters(line);

    const firstChar = line.querySelector('w') as HTMLElement;
    if (!firstChar) return null;

    let char = firstChar.textContent || '';
    const nextChar = firstChar.nextElementSibling as HTMLElement | null;

    const parentWord = firstChar.parentElement as HTMLElement;
    firstChar.remove();

    if (parentWord && parentWord.children.length === 0) {
      parentWord.remove();
    }

    if (nextChar && nextChar.textContent !== ' ') {
      return { char, needSpace: false };
    } else {
      return { char: char + ' ', needSpace: false };
    }

  }

  appendCharToLastWord(line: HTMLElement, charText: string, needSpace: boolean) {
    let lastWord = line.querySelector('word:last-child') as HTMLElement;

    if (!lastWord) {
      lastWord = document.createElement('word');
      line.appendChild(lastWord);
    }

    if (needSpace) {
      const space = document.createElement('w');
      space.textContent = ' ';
      lastWord.appendChild(space);
    }

    const w = document.createElement('w');
    w.textContent = charText;
    lastWord.appendChild(w);
  }

  moveCharToPreviousLine() {
    const currentLine = this.getSelectedLine();
    if (!currentLine) return;

    const prevLine = this.getSiblingLine(currentLine, 'prev');
    if (!prevLine) return;

    const result = this.removeFirstChar(currentLine);
    if (!result || !result.char) return;

    this.appendCharToLastWord(prevLine, result.char, result.needSpace);

    this.pdfmeasure();
  }
  // next

  removeLastChar(line: HTMLElement): { char: string | null; needSpace: boolean; } | null {

    this.normalizeLineToLetters(line);

    const chars = line.querySelectorAll('w');
    if (!chars.length) return null;

    const lastChar = chars[chars.length - 1] as HTMLElement;
    const char = lastChar.textContent;
    // console.log("Agalya",char)

    const prevChar = lastChar.previousElementSibling as HTMLElement | null;

    const parentWord = lastChar.parentElement as HTMLElement;
    lastChar.remove();

    if (parentWord && parentWord.children.length === 0) {
      parentWord.remove();
    }
    if (this.isfirst) {
      this.isfirst = false
      return { char: char + ' ', needSpace: false };
    }
    else if (prevChar && prevChar.textContent !== ' ') {
      return { char, needSpace: false };

    } else if (!prevChar || prevChar.textContent === ' ') {
      return { char: ' ' + char, needSpace: false };
    }

    return null;
  }

  preCharToFirstWord(line: HTMLElement, charText: string, needSpace: boolean) {
    let firstWord = line.querySelector('word') as HTMLElement;

    if (!firstWord) {
      firstWord = document.createElement('word');
      line.prepend(firstWord);
    }

    if (needSpace) {
      const space = document.createElement('w');
      space.textContent = ' ';
      firstWord.prepend(space);
    }
    const w = document.createElement('w');
    w.textContent = charText;
    firstWord.prepend(w);
  }

  moveCharToNextLine() {
    const currentLine = this.getSelectedLine();
    if (!currentLine) return;

    const nextLine = this.getSiblingLine(currentLine, 'next');
    if (!nextLine) return;

    const result = this.removeLastChar(currentLine);
    if (!result || !result.char) return;

    this.preCharToFirstWord(nextLine, result.char, result.needSpace);

    this.pdfmeasure();
  }
  // Para
  selectFullPara(event: MouseEvent) {
    if (!this.isParaMode) return;

    const para = (event.target as HTMLElement)
      .closest('.indent.hyphenate, .hyphenate') as HTMLElement;
    if (!para) return;

    event.preventDefault();
    event.stopPropagation();

    document.querySelectorAll('.para-selected')
      .forEach(p => {
        p.classList.remove('para-selected');
        (p as HTMLElement).style.backgroundColor = '';
      });

    para.classList.add('para-selected');
    para.style.backgroundColor = 'rgb(255, 211, 196)';

    this.selectedPara = para;

    this.service.setSelectedPara(para);
  }
  paraaboove() {
    this.service.abovePt$.subscribe(pt => {
      const para = this.service.getSelectedPara();
      if (!para) return;
      para.style.paddingTop = `${pt}pt`;
    });
  }

  parabelow() {
    this.service.belowPt$.subscribe(pt => {
      const para = this.service.getSelectedPara();
      if (!para) return;
      para.style.paddingBottom = `${pt}pt`;
    });
  }

  ParaMoveAction() {
    this.service.paraMove$.subscribe(direction => {
      if (!direction) return;
      this.moveSelectedPara(direction);
    });
  }

  getAllParas(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll('.indent.hyphenate, .hyphenate')
    ) as HTMLElement[];
  }

  getPageFromPara(para: HTMLElement): HTMLElement | null {
    return para.closest('[data-icodex-page-container]');
  }

  moveSelectedPara(direction: 'previous' | 'next') {

    const para = this.service.getSelectedPara();
    if (!para) return;

    if (para.classList.contains('abstractPara')) return;

    const allParas = this.getAllParas();

    const lastAbstractIndex = allParas
      .map((p, i) => p.classList.contains('abstractPara') ? i : -1)
      .filter(i => i !== -1)
      .pop() ?? -1;
    const index = allParas.indexOf(para);
    if (index === -1) return;

    if (direction === 'previous' && index - 1 <= lastAbstractIndex) {
      return;
    }
    const targetIndex =
      direction === 'next' ? index + 1 : index - 1;

    if (targetIndex < 0 || targetIndex >= allParas.length) return;

    const targetPara = allParas[targetIndex];

    const currentPage = this.getPageFromPara(para);
    const targetPage = this.getPageFromPara(targetPara);

    if (currentPage !== targetPage) {
      if (direction === 'next') {
        targetPara.parentElement?.insertBefore(para, targetPara);
      } else {
        targetPara.parentElement?.insertBefore(para, targetPara.nextSibling);
      }
    } else {
      const parent = targetPara.parentElement;
      if (!parent) return;

      if (direction === 'next') {
        parent.insertBefore(para, targetPara.nextSibling);
      } else {
        parent.insertBefore(para, targetPara);
      }
    }

    this.afterParaMove(para);
  }

  afterParaMove(para: HTMLElement) {
    para.classList.add('para-selected');
    para.style.backgroundColor = 'rgb(255, 211, 196)';

    setTimeout(() => this.pdfmeasure(), 30);
  }

  // edit

  listenParaAlignment() {
    this.service.paraAlign$.subscribe(align => {
      if (!align) return;

      const para = this.service.getSelectedPara();
      if (!para) return;

      para.style.textAlign = align;

    });
  }
  // listenParaList() {
  //   this.service.paraList$.subscribe(type => {
  //     if (!type) return;

  //     const para = this.service.getSelectedPara();
  //     if (!para) return;

  //     const text = para.innerText.trim();

  //     let listHTML = '';

  //     if (type === 'bullet') {
  //       listHTML = `
  //       <ul style="padding-left: 20px; margin: 0;">
  //         <li>${text}</li>
  //       </ul>`;
  //     }

  //     if (type === 'number') {
  //       listHTML = `
  //       <ol style="padding-left: 20px; margin: 0;">
  //         <li>${text}</li>
  //       </ol>`;
  //     }

  //     para.innerHTML = listHTML;


  //     setTimeout(() => this.pdfmeasure(), 30);
  //   });
  // }

  listenLetterSpace() {
    this.service.letterPt$.subscribe(value => {
      const para = this.service.getSelectedPara();
      if (!para) return;

      para.style.setProperty(
        'letter-spacing',
        `${value}px`,
        'important'
      );
    });
  }
  listenWordSpace() {
    this.service.wordPt$.subscribe(value => {
      const para = this.service.getSelectedPara();
      if (!para) return;

      para.style.wordSpacing = `${value}pt`;
    });
  }

  listenIndent() {
    this.service.indentPt$.subscribe(value => {
      const para = this.service.getSelectedPara();
      if (!para) return;

      para.style.setProperty('text-indent', `${value}pt`, 'important');
    });
  }

  fontSizeValue: number = 10;

  listenFontSize() {
    this.service.fontSizeAction$.subscribe(action => {
      if (!action) return;

      const para = this.service.getSelectedPara();
      if (!para) return;

      let currentPt: number;
      const inlineSize = para.style.fontSize;

      if (inlineSize && inlineSize.includes('pt')) {
        currentPt = parseFloat(inlineSize);
      } else {
        const computedPx = parseFloat(
          window.getComputedStyle(para).fontSize
        );
        currentPt = +(computedPx * 0.75).toFixed(1);
      }
      if (action === 'increase') {
        currentPt += 0.1;
      } else {
        currentPt = Math.max(6, currentPt - 0.1);
        // console.log("Agaluya",currentPt)
      }
      para.style.setProperty(
        'font-size',
        `${currentPt}pt`,
        'important'
      );
      this.fontSizeValue = currentPt;
    });
  }

deletePara() {
  this.service.DeletePara$.subscribe(para => {
    if (para === null && this.selectedPara) {
      this.selectedPara.remove(); 
      this.selectedPara = null;
    }
  });
}

}

