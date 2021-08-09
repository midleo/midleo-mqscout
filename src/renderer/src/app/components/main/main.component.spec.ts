import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentMainContent }  from './main.component';

describe('ComponentMainContent', () => {
  let component: ComponentMainContent;
  let fixture: ComponentFixture<ComponentMainContent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentMainContent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentMainContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
