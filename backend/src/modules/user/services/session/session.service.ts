import { Request } from 'express';
import { Session, SessionData } from 'express-session';

type ExpressSessionResult = Session & Partial<SessionData>;
type ExpressSessionCallback = (err: any) => void;

export class SessionService {
  public async regenerate(request: Request): Promise<ExpressSessionResult> {
    return this.makeAsync((cb) => request.session.regenerate(cb));
  }

  public async destroy(request: Request): Promise<ExpressSessionResult> {
    return this.makeAsync((cb) => request.session.destroy(cb));
  }

  public delete(request: Request): void {
    delete request.session;
  }

  public async save(request: Request): Promise<ExpressSessionResult> {
    return this.makeAsync((cb) => request.session.save(cb));
  }

  public async reload(request: Request): Promise<ExpressSessionResult> {
    return this.makeAsync((cb) => request.session.reload(cb));
  }

  private async makeAsync(
    func: (call: ExpressSessionCallback) => ExpressSessionResult,
  ) {
    return new Promise<ExpressSessionResult>((resolve, reject) => {
      const result = func((error) => {
        if (error) reject(error);

        resolve(result);
      });
    });
  }
}
