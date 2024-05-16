import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  readonly NOT_FINISHED: number = -1;
  readonly NOT_VALID: number = 0;
  readonly VALID: number = 1;
  string_: string = "";
  tick_milisecs: number = 500;
  success: number = this.NOT_FINISHED;
  stack: Array<string> = ["Z"];
  current_state: string = "";
  character: string = "";
  character_index: number = 0;
  in_validation: boolean = false;

  constructor(private changeDetection: ChangeDetectorRef) {}

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  clear_validar(initial_state: string) {
    this.success = this.NOT_FINISHED;
    this.stack = ["Z"];
    this.current_state = initial_state;
    this.character = "";
    this.changeDetection.detectChanges();
  }

  async validar() {
    // a^nb^m | n != m
    this.in_validation = true;
    const initial_state: string = "q1";
    const final_states: Array<string> = ["q3"];
    this.clear_validar(initial_state);

    await this.delay(this.tick_milisecs);

    for (let i = 0; i < this.string_.length + 1; i++) {
      if (i === this.string_.length) {
        this.character = "";
      } else {
        this.character = this.string_.charAt(i);
      }
      this.character_index = i;

      let stack_symbol: string = this.stack[this.stack.length - 1];

      console.log(this.current_state, this.character, stack_symbol);
      let res = this.delta_transition(this.current_state, this.character, stack_symbol);
      console.log("Result: ", res);
      
      // get new state
      let next_state: string = res[0];
      if (next_state === "") {
        this.success = this.NOT_VALID;
        return;
      }

      this.current_state = next_state;

      // push new top symbols
      let top_symbols: Array<string> = res[1];
      console.log("STACK");
      this.stack.pop();
      console.log(this.stack);
      this.stack = this.stack.concat(top_symbols);
      console.log(this.stack);
      console.log("STACK END");
      this.changeDetection.detectChanges();

      await this.delay(this.tick_milisecs);
      console.log(this.current_state);
    }

    final_states.forEach((state: string) => {
      if (this.current_state !== state) this.success = this.NOT_VALID;
      else this.success = this.VALID;
    });
  }

  delta_transition(current_state: string, character: string, stack_symbol: string): [string, Array<string>] {
    /*
    a^nb^m | n != m

    d(q1, a, Z) = (q1, AZ)
    d(q1, a, A) = (q1, AA)
    d(q1, b, Z) = (q2, BZ)
    d(q1, b, A) = (q2, epsilon)
    d(q1, epsilon, Z) = inválido
    d(q1, epsilon, A) = (q3, A)

    d(q2, a, Z) = inválido
    d(q2, a, A) = inválido
    d(q2, a, B) = inválido
    d(q2, b, Z) = (q2, BZ)
    d(q2, b, A) = (q2, epsilon)
    d(q2, b, B) = (q2, BB)
    d(q2, epsilon, Z) = inválido
    d(q2, epsilon, A) = (q3, A)
    d(q2, epsilon, B) = (q3, B)
    */
    let next_state: string = "";
    let top_symbols: Array<string> = [];

    switch (current_state) {
      case 'q1':
        if (character === "a") {
          if (stack_symbol === "Z") {
            next_state = "q1";
            top_symbols = ["Z", "A"];  
          }
          else if (stack_symbol === "A") {
            next_state = "q1";
            top_symbols = ["A", "A"];  
          }
        }
        else if (character === "b") {
          if (stack_symbol === "Z") {
            next_state = "q2";
            top_symbols = ["Z", "B"];
          }
          else if (stack_symbol === "A") {
            next_state = "q2";
            top_symbols = [];
          }
        }
        else if (character === "") {
          if (stack_symbol === "A") {
            next_state = "q3";
            top_symbols = ["A"];
          }
        }
        break;

    case 'q2':
      if (character === "b") {
        if (stack_symbol === "Z") {
          next_state = "q2";
          top_symbols = ["Z", "B"];  
        }
        else if (stack_symbol === "A") {
          next_state = "q2";
          top_symbols = [];
        }
        else if (stack_symbol === "B") {
          next_state = "q2";
          top_symbols = ["B", "B"];  
        }
      }
      else if (character === "") {
        if (stack_symbol === "A") {
          next_state = "q3";
          top_symbols = ["A"];
        }
        else if (stack_symbol === "B") {
          next_state = "q3";
          top_symbols = ["B"];
        }
      }
      break;
    }
    
    return [next_state, top_symbols];
  }
}
