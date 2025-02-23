import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IFTUIColor {
  background: string;
  foreground: string;
  inputType: 'inlineStyle' | 'cssClass';
}

export interface IFTUIDialogActionButton {
  name: string;
  isDefault: boolean;
  isDisabled: boolean;
  isHidden: boolean;
  tooltip?: string;
  color: IFTUIColor;
}

export interface IFTUIDialogIcon {
  name: string;
  color: IFTUIColor;
}

export interface IFTUIDialogIncomingData {
  dialogTitle: string;
  message: string;
  messageCategory: 'information' | 'warning' | 'error';
  actionButtons: IFTUIDialogActionButton[];
  hideDialogIcon: boolean;
}

@Injectable({
  providedIn: 'root' // Ensures the service is available globally
})
export class FTUIConfirmationDialogService implements OnDestroy {
  private dialogDataSubject = new BehaviorSubject<IFTUIDialogIncomingData | null>(null);
  dialogData$: Observable<IFTUIDialogIncomingData | null> = this.dialogDataSubject.asObservable();

  constructor() {}

  ngOnDestroy(): void {
    this.dialogDataSubject.complete();
    console.log('Dialog service destroyed');
  }

  openDialog(data: IFTUIDialogIncomingData) {
    console.log('Opening dialog with data:', data);
    this.dialogDataSubject.next(data);
  }

  closeDialog() {
    console.log('Closing dialog');
    this.dialogDataSubject.next(null);
  }

  getMessageCategoryColor(messageCategory: 'information' | 'warning' | 'error'): IFTUIColor {
    switch (messageCategory) {
      case 'information':
        return { background: 'beige', foreground: 'green', inputType: 'inlineStyle' };
      case 'warning':
        return { background: 'orange', foreground: 'darkslategray', inputType: 'inlineStyle' };
      case 'error':
        return { background: 'red', foreground: 'white', inputType: 'inlineStyle' };
      default:
        throw new Error('Invalid message category: ' + messageCategory);
    }
  }

  getMessageIconConfig(messageCategory: 'information' | 'warning' | 'error'): IFTUIDialogIcon {
    switch (messageCategory) {
      case 'information':
        return { name: 'info', color: { background: 'transparent', foreground: this.getMessageCategoryColor(messageCategory).foreground, inputType: this.getMessageCategoryColor(messageCategory)?.inputType } };
      case 'warning':
        return { name: 'warning', color: { background: 'transparent', foreground: this.getMessageCategoryColor(messageCategory).foreground, inputType: this.getMessageCategoryColor(messageCategory)?.inputType } };
      case 'error':
        return { name: 'error', color: { background: 'transparent', foreground: this.getMessageCategoryColor(messageCategory).foreground, inputType: this.getMessageCategoryColor(messageCategory)?.inputType } };
      default:
        throw new Error('Invalid message category: ' + messageCategory);
    }
  }

  handleActionButtonClick(data: IFTUIDialogActionButton) {
    console.log('Handling action button click:', data);
    this.closeDialog();
  }
}












import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FTUIConfirmationDialogService, IFTUIDialogActionButton, IFTUIColor, IFTUIDialogIcon } from '../../services/confirmation-dialog.service';

@Component({
  selector: 'ftui-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class FTUIConfirmationDialogComponent implements OnInit {
  @Input({ required: true }) dialogTitle: string = 'Confirmation...';
  @Input({ required: true }) message: string = 'Are you sure you want to delete this record?';
  @Input({ required: true }) messageCategory: 'information' | 'warning' | 'error' = 'information';
  @Input({ required: true }) actionButtons: IFTUIDialogActionButton[] = [];
  @Input({ required: false }) hideDialogIcon: boolean = false;

  @Output() onActionButtonClicked: EventEmitter<IFTUIDialogActionButton> = new EventEmitter<IFTUIDialogActionButton>();

  constructor(private dialogService: FTUIConfirmationDialogService) {
    console.log('Confirmation dialog component constructor called with inputs:', {
      dialogTitle: this.dialogTitle,
      message: this.message,
      messageCategory: this.messageCategory,
      actionButtons: this.actionButtons,
      hideDialogIcon: this.hideDialogIcon
    });
  }

  ngOnInit() {
    console.log('Confirmation dialog component initialized with data:', {
      dialogTitle: this.dialogTitle,
      message: this.message,
      messageCategory: this.messageCategory,
      actionButtons: this.actionButtons,
      hideDialogIcon: this.hideDialogIcon
    });
  }

  get messageCategoryColor(): IFTUIColor {
    console.log('Getting message category color for:', this.messageCategory);
    return this.dialogService.getMessageCategoryColor(this.messageCategory);
  }

  get messageIconConfig(): IFTUIDialogIcon {
    console.log('Getting message icon config for:', this.messageCategory);
    return this.dialogService.getMessageIconConfig(this.messageCategory);
  }

  actionButtonClicked(actionButton: IFTUIDialogActionButton) {
    console.log('Button clicked in component:', actionButton.name);
    this.dialogService.handleActionButtonClick(actionButton);
    this.onActionButtonClicked.emit(actionButton);
  }
}













<div class="modal modal-open">
  <div class="modal-box max-n-70vh p-0">
    <div class="modal-header p-2" [ngStyle]="{'background-color': messageCategoryColor?.background, 'color': messageCategoryColor?.foreground}">
      <div class="flex items-center">
        <i class="material-icons mr-2 text-{{(messageIconConfig?.color?.foreground)}}" *ngIf="!hideDialogIcon">
          {{messageIconConfig?.name}}
        </i>
        <h3 class="text-lg font-bold">{{dialogTitle}}</h3>
      </div>
    </div>
    <div class="modal-content my-4 p-2 overflow-auto">
      <div [innerHTML]="message"></div>
    </div>
    <div class="modal-action justify-between flex-wrap gap-2 p-2">
      <ng-container *ngFor="let button of actionButtons">
        <ng-container *ngIf="!button.isHidden">
          <button
            class="btn"
            [class.btn-border-none]="!button?.isDefault"
            [class.btn-primary]="button?.isDefault"
            [class.btn-disabled]="button.isDisabled"
            [attr.title]="button.tooltip"
            [ngStyle]="button?.color?.inputType === 'inlineStyle' ? {'background-color': button?.color?.background, 'color': button?.color?.foreground} : null"
            [ngClass]="button?.color?.inputType === 'cssClass' ? [button?.color?.background, button?.color?.foreground] : ''"
            (click)="actionButtonClicked(button)">
            {{button.name}}
          </button>
        </ng-container>
      </ng-container>
    </div>
  </div>
</div>
