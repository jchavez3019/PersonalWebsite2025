import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

// Define a simple structure for a message
interface ChatMessage {
  type: 'user' | 'agent' | 'system';
  content: string;
}

@Component({
  selector: 'app-toy-agentic-framework-frontend',
  imports: [CommonModule, FormsModule], // Ensure FormsModule is imported
  templateUrl: './toy-agentic-framework-frontend.component.html',
  styleUrl: './toy-agentic-framework-frontend.component.css'
})
export class ToyAgenticFrameworkFrontendComponent {
  // Access the chat display area to enable auto-scrolling
  @ViewChild('chatDisplay') private chatDisplayRef!: ElementRef;

  currentPrompt: string = '';
  messages: ChatMessage[] = [
    { type: 'system', content: "Hello! I'm the Toy Agentic Framework. Ask me to perform a task (e.g., 'Summarize the global economy')." }
  ];

  constructor() { }

  /**
   * Handles sending the message when the button is clicked or Enter is pressed.
   * @param event Optional keyboard event to prevent default behavior (like form submission).
   */
  sendMessage(event?: Event): void {
    if (event) {
      // Prevent newline from being inserted when hitting Enter
      event.preventDefault();
    }

    const trimmedPrompt = this.currentPrompt.trim();

    if (trimmedPrompt) {
      // 1. Add the user's message to the display
      this.messages.push({ type: 'user', content: trimmedPrompt });

      // 2. Clear the input field
      this.currentPrompt = '';

      // 3. Immediately scroll to the bottom to show the new message
      this.scrollToBottom();

      // 4. (TODO: Next step) Call the API endpoint here to start the task!
      // this.startAgentTask(trimmedPrompt);

    }
  }

  private scrollToBottom(): void {
    try {
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        const element = this.chatDisplayRef.nativeElement;
        element.scrollTop = element.scrollHeight;
      }, 0);
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
