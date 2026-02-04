import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { BehaviorSubject } from 'rxjs';

// import  html2pdf from 'html2pdf.js';
export interface HyphenationData {
  hyphenation: string;
  isArticleTitle: boolean;
}
export type LineAction = 'next' | 'previous';
interface IndentPayload {
  paraId: string;
  indent: number;
}



@Injectable({
  providedIn: 'root'
})
export class MyServiceService {
  savedRange: Range | null = null;
  enableWordSelection = false;
  enableLineSelection = false;

  constructor() { }
  // Sidepanel
  private sidebar = new BehaviorSubject<any>(null);
  sidebarmenu$ = this.sidebar.asObservable();

  sendValueFromTable(value: any) {
    this.sidebar.next(value);
  }

  // Toolbar
  private Toolbar = new BehaviorSubject<any>(null);
  sidebarvalue$ = this.Toolbar.asObservable();

  sendValueFromToolbar(value: any) {
    this.Toolbar.next(value);
  }

  // Header
  private Header = new BehaviorSubject<any>(null);
  headervalue$ = this.Header.asObservable();

  sendValueFromHeader(value: any) {
    this.Header.next(value);
  }

  // Insert

  private Insert = new BehaviorSubject<any>(null);
  Insertvalue$ = this.Insert.asObservable();

  sendValueFromInsertmenu(value: any) {
    this.Insert.next(value);
  }

  // Auitopaginate
  private paginate = new BehaviorSubject<any>(null);
  paginatevalue$ = this.paginate.asObservable();

  sendValueFromPaginatemenu(value: any) {
    this.paginate.next(value);
  }

  // layout
  private layout = new BehaviorSubject<any>(null);
  layoutvalue$ = this.layout.asObservable();

  sendValueFrompdf(value: any) {
    this.layout.next(value);
  }



  downloadPDF() {
    const container: any = document.getElementById('icodex-viewer-viewport');
    html2pdf()
      .set({
        margin: 0.1,
        filename: 'document.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(container)
      .save();
  }

  // word
  private selectedWordSource = new BehaviorSubject<any>(null);
  selectedWord$ = this.selectedWordSource.asObservable();

  setSelectedWord(wordElement: HTMLElement) {
    this.selectedWordSource.next(wordElement);
  }


  // MyServiceService
  get lastClickedWord(): HTMLElement | null {
    return this.selectedWordSource.getValue();
  }


  // hypanated
  //  private hyphenationSource = new BehaviorSubject<string>('');
  // currentHyphenation$ = this.hyphenationSource.asObservable();

  // updateHyphenation(value: string) {
  //   this.hyphenationSource.next(value);
  // }
  private hyphenationSource = new BehaviorSubject<HyphenationData>({
    hyphenation: '',
    isArticleTitle: false
  });
  currentHyphenation$ = this.hyphenationSource.asObservable();
  updateHyphenation(data: HyphenationData) {
    this.hyphenationSource.next(data);
  }

  private lastwordRatio = new BehaviorSubject<any>(null);
  Ratio$ = this.lastwordRatio.asObservable();

  sendValueFromRadio(value: any) {
    this.lastwordRatio.next(value);
  }
  // ratio
  private selectedHyphenOption = new BehaviorSubject<string | null>(null);
  selectedHyphenOption$ = this.selectedHyphenOption.asObservable();

  sendSelectedHyphenOption(value: string) {
    this.selectedHyphenOption.next(value);
  }
  // ratio last word
  private lastword = new BehaviorSubject<any>(null);
  Insertvalueinsidepanel$ = this.lastword.asObservable();

  sendValueFrommastercomponent(value: any) {
    this.lastword.next(value);
  }
  private checkpoint = new BehaviorSubject<any>(null);
  Insertvalueincheckpoint$ = this.checkpoint.asObservable();

  sendValueFromsidepanelcomponent(value: any) {
    this.checkpoint.next(value);
  }

  // ration options bal word
  private balWordSource = new BehaviorSubject<string | null>(null);
  currentHyphenText$ = this.balWordSource.asObservable();

  setHyphenText(text: string | null) {
    this.balWordSource.next(text);
  }
  // doubleword
  private doubleword = new BehaviorSubject<string | null>(null);
  doublewordinpdf$ = this.doubleword.asObservable();

  sendValueFromSidepanel(text: string | null) {
    this.doubleword.next(text);
  }


  // LINE
  private lineModeSource = new BehaviorSubject<boolean>(false);
  lineMode$ = this.lineModeSource.asObservable();

  setLineMode(value: boolean) {
    this.lineModeSource.next(value);
  }

  private lineActionSubject =
    new BehaviorSubject<'next' | 'previous' | null>(null);

  lineAction$ = this.lineActionSubject.asObservable();

  setnextprevious(action: 'next' | 'previous') {
    this.lineActionSubject.next(action);
  }


  // Next Previous
  public lineCharAction = new BehaviorSubject<'firstCharPrevLine' | 'lastCharNextLine' | null>(null);

  public lineCharAction$ = this.lineCharAction.asObservable();

  triggerFirstCharPrevLine() {
    this.lineCharAction.next('firstCharPrevLine');
  }

  triggerLastCharNextLine() {
    this.lineCharAction.next('lastCharNextLine');
  }


  // para
  private paraModeSource = new BehaviorSubject<boolean>(false);
  paraMode$ = this.paraModeSource.asObservable();

  setParaMode(value: boolean) {
    this.paraModeSource.next(value);
  }
  // space above
  private abovePtSource = new BehaviorSubject<number>(0);
  abovePt$ = this.abovePtSource.asObservable();

  setAbovePt(value: number) {
    this.abovePtSource.next(value);
  }

  private selectedPara: HTMLElement | null = null;

  setSelectedPara(para: HTMLElement) {
    this.selectedPara = para;
  }

  getSelectedPara(): HTMLElement | null {
    return this.selectedPara;
  }
  //  space below
  private belowPtSource = new BehaviorSubject<number>(0);
  belowPt$ = this.belowPtSource.asObservable();

  setBelowPt(value: number) {
    this.belowPtSource.next(value);
  }


  // Para Move Action
  private paraMoveSource =
    new BehaviorSubject<'previous' | 'next' | null>(null);

  paraMove$ = this.paraMoveSource.asObservable();

  movePara(direction: 'previous' | 'next') {
    this.paraMoveSource.next(direction);
  }

  // edit
 
  // Indentation
  private indentPtSource = new BehaviorSubject<number>(0);
  indentPt$ = this.indentPtSource.asObservable();

  setIndentPt(value: number) {
    this.indentPtSource.next(value);
  }

  //  letterspace
  private letterPtSource = new BehaviorSubject<number>(1.0);
  letterPt$ = this.letterPtSource.asObservable();

  setLetterSpacing(value: number) {
    this.letterPtSource.next(value);
  }

  // moveword
  private wordPtSource = new BehaviorSubject<number>(0);
  wordPt$ = this.wordPtSource.asObservable();

  setWordSpacing(value: number) {
    this.wordPtSource.next(value);

    const para = document.querySelector('.para-selected') as HTMLElement;
    if (!para) return;

    para.style.wordSpacing = `${value}pt`;

  }
  // font size
  private fontSize$ =
    new BehaviorSubject<'increase' | 'decrease' | null>(null);

  fontSizeAction$ = this.fontSize$.asObservable();

  changeFontSize(type: 'increase' | 'decrease') {
    this.fontSize$.next(type);
  }
  // deletepara
  private deletepara = new BehaviorSubject<HTMLElement | null>(null);
  DeletePara$ = this.deletepara.asObservable();

  deletePara(value: HTMLElement | null) {
    this.deletepara.next(value);
  }
// Formating para
getSelectePara(): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  let node = selection.anchorNode as Node;

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement!;
  }

    return (node as HTMLElement).closest('p, div');
}
// list
private listModeSource = new BehaviorSubject<boolean>(false);
listMode$ = this.listModeSource.asObservable();

setListMode(value: boolean) {
  this.listModeSource.next(value);
}


// list
private ListabovePtSource = new BehaviorSubject<number>(0);
  ListabovePt$ = this.ListabovePtSource.asObservable();

  ListsetAbovePt(value: number) {
    this.ListabovePtSource.next(value);
  }

  private selectedList: HTMLElement | null = null;

  setSelectedList(para: HTMLElement) {
    this.selectedList = para;
  }

  getSelectedList(): HTMLElement | null {
    return this.selectedList;
  }
  //  space below
  private ListbelowPtSource = new BehaviorSubject<number>(0);
  ListbelowPt$ = this.ListbelowPtSource.asObservable();

  ListsetBelowPt(value: number) {
    this.ListbelowPtSource.next(value);
  }

}