import { Socket } from 'socket.io';

export class UserData {
  public socket: Socket;
  public username: string;
  public isTyping: boolean;

  private _isTypingTimeout: NodeJS.Timeout;

  public constructor(socket: Socket, username: string) {
    this.socket = socket;
    this.username = username;
    this.isTyping = false;
  }

  public type(): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('isComposing');
    }

    clearTimeout(this._isTypingTimeout);
    this._isTypingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.socket.emit('composingEnd');
    }, 1500);
  }

  public stopTyping(): void {
    this.isTyping = false;
    clearTimeout(this._isTypingTimeout);
    this.socket.emit('composingEnd');
  }
}
