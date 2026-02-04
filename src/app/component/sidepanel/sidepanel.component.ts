import { Component } from '@angular/core';
import { MyServiceService } from 'src/app/my-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent {
  selectedUnit = 'mm';
  hyphenationValue = '';
  subscription!: Subscription;
  hyphenationOptions: string[] = [];
  allPagesData: any[] = [];
  firstPageData: any;
  isCollapsed = true;
  iscontent = true;
  editcontent = true;
  stylecontent = true;
  autopaginate = false;
  view = 'default';
  sidemenu = false;
  minas = true;
  arrowshow = false;
  defaultinfo = true;
  insertshow = false;
  issresult = false;
  selectratio = false;
  isfirst = true;
  currentHyphenText: string = '';
  nextPrevious = false;
  letterSpacingMap: Record<string, number> = {};

  constructor(private service: MyServiceService) { }

  ngOnInit() {
    this.Sidebarpanel();
    this.contentexpand();
    this.contentexpand1();
    this.contentexpand2();
    this.Defaultword();
    this.wordmethod();
    this.headermenu();
    this.AutopaginatePlus();
    this.Insertminas();
    this.Insertshow();
    this.paginate();
    this.layout();
    this.hypanated();
    this.ratio();
    this.ratiolastword();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  wordmethod() {
    this.service.sidebarvalue$.subscribe(data => {
      if (data === "word") {
        this.sidemenu = true;
        this.defaultinfo = false;
        this.word();
        this.autopaginate = true;
        this.minas = true;
        this.stylecontent = true;
      }
      else if (data === "line") {
        this.defaultinfo = false;
        this.line();

      } else if (data === "para") {
        this.defaultinfo = false;
        this.para();
      }
      else if (data === "list") {
        this.defaultinfo = false;
        this.list();
      }
    })
  }

  headermenu() {
    this.service.headervalue$.subscribe(data => {
      this.defaultinfo = true;
    })
  }
  Insertshow() {
    this.service.Insertvalue$.subscribe(response => {
      this.Insertshow = response;
      this.insertshow = true;
      this.sidemenu = true;
      this.autopaginate = true;
      this.editcontent = true;
      this.minas = false;
    })
  }
  paginate() {
    this.service.paginatevalue$.subscribe(response => {
      this.sidemenu = true;
      this.autopaginate = false;
      this.editcontent = true;
      this.minas = true;
      this.stylecontent = true;
    })
  }
  // toggle
  Sidebarpanel() {
    this.isCollapsed = !this.isCollapsed;
    this.service.sendValueFromTable(this.isCollapsed)
  }
  // sidebar
  contentexpand() {
    this.iscontent = !this.iscontent;
  }
  contentexpand1() {
    this.stylecontent = !this.stylecontent;
  }
  contentexpand2() {
    this.editcontent = !this.editcontent;
  }
  AutopaginatePlus() {
    this.autopaginate = !this.autopaginate;
  }
  Insertminas() {
    this.minas = !this.minas;
  }
  arrow() {
    this.arrowshow = !this.arrowshow;
  }
  // First Tool
  word() {
    this.view = 'word';
    this.editcontent = false;
    this.service.enableWordSelection = true;
    this.service.enableLineSelection = false;
    this.service.setLineMode(false);
    this.service.setParaMode(false);

  }
  line() {
    this.view = 'line';
    this.editcontent = false;
    this.service.enableWordSelection = false;
    this.service.enableLineSelection = true;
    this.service.setLineMode(true);
    this.service.setParaMode(false);


  }
  para() {
    this.view = 'para';
    this.editcontent = false;
    this.service.setLineMode(false);
    this.service.setParaMode(true);


  }
  list() {
    this.view = 'list';
    this.editcontent = false;
    this.service.setListMode(true);
    this.service.setParaMode(false);

  }
  Defaultword() {
    this.view = 'default';
  }
  edit() {
    this.view = 'edit'
  }

  layout() {
    this.service.layoutvalue$.subscribe(data => {
      if (data) {
        this.allPagesData = data;
        this.firstPageData = data[0];
      }
    });
  }
  convert(px: number, unit: string): string {
    if (!px) return '0';

    let value = 0;

    switch (unit) {
      case 'mm':
        value = px * 0.264583;
        break;
      case 'cm':
        value = px * 0.0264583;
        break;
      case 'inch':
        value = px / 96;
        break;
      case 'pt':
        value = px * 0.75;
        break;
      default:
        value = px;
    }

    return `${Math.round(value)}${unit}`;

  }
  get trimSize() {
    const size = this.firstPageData?.pageSize;
    if (!size) return '';
    return `${this.convert(size.width, this.selectedUnit)} x ${this.convert(size.height, this.selectedUnit)}`;
  }

  get textSize() {
    const size = this.firstPageData?.textBlock;
    if (!size) return '';
    return this.convert(size.height, this.selectedUnit);
  }

  get columnSize() {
    const size = this.firstPageData?.textBlock;
    if (!size) return '';
    return this.convert(size.width, this.selectedUnit);
  }


  get gutterSize() {
    return this.firstPageData?.gutter || 0;
  }

  get topMargin() {
    return this.convert(this.firstPageData?.margins?.top, this.selectedUnit);
  }

  get leftMargin() {
    return this.convert(this.firstPageData?.margins?.left, this.selectedUnit);
  }

  get bottomMargin() {
    return this.convert(this.firstPageData?.margins?.bottom, this.selectedUnit);
  }

  get rightMargin() {
    return this.convert(this.firstPageData?.margins?.right, this.selectedUnit);
  }

  get pageNumber() {
    return this.firstPageData?.pageNumber || 0;
  }
  applyBold() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;
    document.querySelectorAll(`word[wordid="${id}"]`)
      .forEach(w => (w as HTMLElement).style.fontWeight = "bold");
  }

  applyItalic() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;
    document.querySelectorAll(`word[wordid="${id}"]`)
      .forEach(w => (w as HTMLElement).style.fontStyle = "italic");
  }

  applyUnderline() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;
    document.querySelectorAll(`word[wordid="${id}"]`)
      .forEach(w => (w as HTMLElement).style.textDecoration = "underline");
  }

  applyStrikethrough() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;

    const words = document.querySelectorAll(`word[wordid="${id}"]`);
    words.forEach(w => {
      (w as HTMLElement).style.textDecoration = 'line-through';
    });
  }


  applySubscript() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;

    const words = document.querySelectorAll(`word[wordid="${id}"]`);
    words.forEach(w => {
      const el = w as HTMLElement;
      el.style.verticalAlign = 'sub';
      el.style.fontSize = 'smaller';
    });
  }


  applySuperscript() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;

    const words = document.querySelectorAll(`word[wordid="${id}"]`);
    words.forEach(w => {
      const el = w as HTMLElement;
      el.style.verticalAlign = 'super';
      el.style.fontSize = 'smaller';
    });
  }


  applyLowercase() {
    const id = document.querySelector('[data-selected="true"]')?.getAttribute("wordid");
    if (!id) return;

    const words = document.querySelectorAll(`word[wordid="${id}"]`);
    words.forEach(w => {
      const el = w as HTMLElement;
      el.textContent = el.textContent?.toLowerCase() || '';
    });
  }

  hypanated() {
    this.subscription = this.service.currentHyphenation$.subscribe(data => {

      if (!data || !data.hyphenation) return;

      this.hyphenationValue = data.hyphenation;

      this.generateHyphenationOptions(data.hyphenation);
    });
  }
  generateHyphenationOptions(hyphenText: string) {
    this.currentHyphenText = hyphenText;

    this.hyphenationOptions = ['No break'];

    const parts = hyphenText.split('~');
    let cumulative = '';

    for (let i = 0; i < parts.length; i++) {
      cumulative += parts[i];

      if (i < parts.length - 1) {
        this.hyphenationOptions.push(cumulative);
      }
    }
    this.hyphenationOptions.push(parts.join(''));
  }
  onHyphenOptionClick(option: string) {
    if (!this.currentHyphenText || !option) return;
    const fullWord = this.currentHyphenText.replace(/~/g, '');
    if (option === 'No break' || option === fullWord) {
      this.service.setHyphenText(null);
      return;
    }
    const balWord = fullWord.substring(option.length);

    this.service.setHyphenText(balWord);
  }
  selectHyphen(option: string) {
    this.hyphenationValue = option;
    if (this.isfirst) {
      this.isfirsty();


    }
    else {
      this.isnotfirst();
    }
  }

  isfirsty() {
    this.service.sendValueFromsidepanelcomponent(true);
    this.isfirst = false;

  }
  isnotfirst() {
    this.service.sendValueFromsidepanelcomponent(false);
  }

  ratio() {
    this.service.Ratio$.subscribe(data => {
      this.issresult = data;

    });
  }
  check(option: any) {
    this.sideratio(option)
    this.service.sendValueFromSidepanel(option);
  }

  sideratio(option: string) {
    this.service.sendSelectedHyphenOption(option);
  }

  ratiolastword() {
    this.service.Insertvalueinsidepanel$.subscribe(data => {
      this.isfirst = true;
    });
  }

  onNext() {
    this.service.setnextprevious('next');
  }

  onPrevious() {
    this.service.setnextprevious('previous');
  }

  previousClick() {
    this.service.triggerFirstCharPrevLine();
  }
  nextClick() {
    this.service.triggerLastCharNextLine();
  }


  abovePt: number = 0;

  // above
  increasePt() {
    this.abovePt += 0.5;
    this.service.setAbovePt(this.abovePt);
  }

  decreasePt() {
    if (this.abovePt > 0) {
      this.abovePt -= 0.5;
    } else {
      this.abovePt -= 1;
    }

    this.service.setAbovePt(this.abovePt);
  }
  // below
  belowPt: number = 0;

  increase() {
    this.belowPt += 0.5;
    this.service.setBelowPt(this.belowPt);
  }

  decrease() {
    if (this.belowPt > 0) {
      this.belowPt -= 0.5;
    } else {
      this.belowPt -= 1;
    }
    this.service.setBelowPt(this.belowPt);
  }
  // above edit
  abovept: number = 0;

  increasept() {
    this.abovePt += 0.5;
    this.service.setAbovePt(this.abovePt);
  }

  decreasept() {
    if (this.abovept > 0) {
      this.abovept -= 0.5;
    } else {
      this.abovept -= 1;
    }

    this.service.setAbovePt(this.abovept);
  }

  // below
  belowpt: number = 0;

  increasebelow() {
    this.belowpt += 0.5;
    this.service.setBelowPt(this.belowpt);
  }

  decreasebelow() {
    if (this.belowpt > 0) {
      this.belowpt -= 0.5;
    } else {
      this.belowpt -= 1;
    }
    this.service.setBelowPt(this.belowpt);
  }
  // Para move
  movePreviousPara() {
    this.service.movePara('previous');
  }

  moveNextPara() {
    this.service.movePara('next');
  }

  // Kerning
  letterSpacing: number = 0;

  increaseLetterSpace() {
    const para = this.service.getSelectedPara();
    if (!para) return;

    this.letterSpacing = +(this.letterSpacing + 0.1).toFixed(1);
    this.applyLetterSpacing(para);
  }
  decreaseLetterSpace() {
    const para = this.service.getSelectedPara();
    if (!para) return;

    this.letterSpacing = +(this.letterSpacing - 0.1).toFixed(1);
    this.applyLetterSpacing(para);
  }
  applyLetterSpacing(para: HTMLElement) {
    para.style.setProperty(
      'letter-spacing',
      `${this.letterSpacing}pt`,
      'important'
    );
  }

  // Tracking
  trackingValue: number = 0;

  moveUp() {
    const para = this.service.getSelectedPara();
    if (!para) return;

    this.trackingValue = +(this.trackingValue + 0.1).toFixed(1);
    this.applyTracking(para);
  }

  moveDown() {
    const para = this.service.getSelectedPara();
    if (!para) return;

    this.trackingValue = +(this.trackingValue - 0.1).toFixed(1);
    this.applyTracking(para);
  }

  applyTracking(para: HTMLElement) {
    para.style.setProperty('word-spacing', `${this.trackingValue}pt`, 'important');
  }


  // Indentation
  indentValue: number = 12;

  onIndentInput(event: any) {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) return;

    this.indentValue = value;
    this.applyIndentToFirstLine();
  }

  getFirstBrokenLine(para: HTMLElement): HTMLElement | null {
    return para.querySelector('div[name="broken"]');
  }

  applyIndentToFirstLine() {
    const para = this.service.getSelectedPara();
    if (!para) return;

    const firstLine = this.getFirstBrokenLine(para);
    if (!firstLine) return;

    firstLine.style.setProperty(
      'text-indent',
      `${this.indentValue}pt`,
      'important'
    );
  }

  increaseIndent() {
    this.indentValue += 1;
    this.applyIndentToFirstLine();
  }

  decreaseIndent() {
    this.indentValue -= 1;
    this.applyIndentToFirstLine();
  }
  // FONT SIZE
  fontSizeValue: number = 10;

  fontIncrease() {
    this.fontSizeValue = +(this.fontSizeValue + 0.1).toFixed(1);
    this.service.changeFontSize('increase');
  }

  fontDecrease() {
    this.fontSizeValue = Math.max(
      6,
      +(this.fontSizeValue - 0.1).toFixed(1)
    );
    this.service.changeFontSize('decrease');
  }
  deletePara() {
    this.service.deletePara(null);
  }

  applyParaFormat(
    type: 'bold' | 'italic' | 'underline' | 'strike' | 'sub' | 'super' | 'lower' | 'caps'
  ) {
    const para = this.service.getSelectedPara();
    if (!para) return;

    switch (type) {
      case 'bold':
        para.style.fontWeight =
          para.style.fontWeight === 'bold' ? 'normal' : 'bold';
        break;

      case 'italic':
        para.style.fontStyle =
          para.style.fontStyle === 'italic' ? 'normal' : 'italic';
        break;

      case 'underline':
        para.style.textDecoration =
          para.style.textDecoration === 'underline' ? 'none' : 'underline';
        break;

      case 'strike':
        para.style.textDecoration =
          para.style.textDecoration === 'line-through' ? 'none' : 'line-through';
        break;

      case 'sub':
        para.style.verticalAlign = 'sub';
        para.style.fontSize = 'smaller';
        break;

      case 'super':
        para.style.verticalAlign = 'super';
        para.style.fontSize = 'smaller';
        break;
      case 'caps':
        para.innerText = para.innerText.toUpperCase();
        break;

      case 'lower':
        para.innerText = para.innerText.toLowerCase();
        break;
    }
  }

  applyParaAlign(type: 'left' | 'center' | 'right' | 'justify') {
    const para = this.service.getSelectedPara();
    if (!para) return;

    para.style.setProperty('text-align', type, 'important');
  }

indentValues: number = 6;

applyIndentMove() {
  const para = this.service.getSelectedPara();
  if (!(para instanceof HTMLElement)) return;
  const contents = para.querySelectorAll('.listitemcontent.number') as NodeListOf<HTMLElement>;

  if (!contents.length) return;

  contents.forEach((content) => {
    content.style.setProperty(
      'padding-left',             
      `${this.indentValues}pt`,
      'important'
    );
  });
}

increasIndent() {
  this.indentValues += 1;
  this.applyIndentMove();
}

decreasIndent() {
  this.indentValues = Math.max(0, this.indentValues - 1);
  this.applyIndentMove();
}

resetIndent() {
  const para = this.service.getSelectedPara();
  if (!(para instanceof HTMLElement)) return;

  const contents = para.querySelectorAll(
    '.listitemcontent.number'
  ) as NodeListOf<HTMLElement>;

  contents.forEach((content) => {
    content.style.removeProperty('padding-left');
  });

  this.indentValues = 0;
}

  abovePtList: number = 1;

increasePtList() {
    this.abovePtList += 1;
    this.service.setAbovePt(this.abovePtList);
  }

  decreasePtList() {
    if (this.abovePtList > 0) {
      this.abovePtList -= 1;
    } else {
      this.abovePtList -= 1;
    }

    this.service.setAbovePt(this.abovePtList);
  }
  // below
  belowPtList: number = 0;

  increaseList() {
    this.belowPtList += 1;
    this.service.setBelowPt(this.belowPtList);
  }

  decreaseList() {
    if (this.belowPtList > 0) {
      this.belowPtList -= 1;
    } else {
      this.belowPtList -= 1;
    }
    this.service.setBelowPt(this.belowPtList);
  }
}