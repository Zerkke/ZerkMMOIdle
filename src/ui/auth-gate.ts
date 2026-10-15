// src/ui/auth-gate.ts
// Ecra bloqueante: sem sessao Supabase, o jogo nao aparece.

import { signIn, signUp, getSession } from '../auth/session';
import { createIcon } from './icons';

export interface AuthGateOptions {
  readonly onAuthenticated: (userId: string) => void;
}

type GateMode = 'form' | 'verify-email';

export function renderAuthGate(opts: AuthGateOptions): void {
  document.querySelectorAll('.auth-gate').forEach((el) => el.remove());

  const root = document.createElement('div');
  root.className = 'auth-gate';

  const bg = document.createElement('div');
  bg.className = 'auth-gate__bg';
  root.appendChild(bg);

  const card = document.createElement('div');
  card.className = 'auth-gate__card';
  root.appendChild(card);

  let mode: GateMode = 'form';
  let pendingEmail = '';

  const render = (): void => {
    card.innerHTML = '';
    if (mode === 'verify-email') {
      renderVerifyEmail(card, pendingEmail, () => { mode = 'form'; render(); });
    } else {
      renderForm(card, (email) => { pendingEmail = email; mode = 'verify-email'; render(); }, opts.onAuthenticated);
    }
  };

  document.body.appendChild(root);
  render();
}

function buildLogo(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'auth-gate__logo';
  const l1 = document.createElement('div');
  l1.className = 'auth-gate__logo-main';
  l1.textContent = 'ZERK';
  wrap.appendChild(l1);
  const l2 = document.createElement('div');
  l2.className = 'auth-gate__logo-sub';
  l2.textContent = 'IDLE MMORPG';
  wrap.appendChild(l2);
  return wrap;
}

function renderForm(card: HTMLElement, onVerify: (email: string) => void, onAuth: (userId: string) => void): void {
  card.appendChild(buildLogo());

  const intro = document.createElement('div');
  intro.className = 'auth-gate__intro';
  intro.textContent = 'Cria conta para guardar o teu progresso na cloud. Podes jogar em qualquer dispositivo com a mesma conta.';
  card.appendChild(intro);

  const emailField = document.createElement('div');
  emailField.className = 'auth-gate__field';
  const el1 = document.createElement('div');
  el1.className = 'auth-gate__label';
  el1.textContent = 'Email';
  emailField.appendChild(el1);
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.className = 'auth-gate__input';
  emailInput.placeholder = 'o.teu.email@exemplo.com';
  emailInput.autocomplete = 'email';
  emailField.appendChild(emailInput);
  card.appendChild(emailField);

  const pwField = document.createElement('div');
  pwField.className = 'auth-gate__field';
  const pl1 = document.createElement('div');
  pl1.className = 'auth-gate__label';
  pl1.textContent = 'Password (minimo 6 caracteres)';
  pwField.appendChild(pl1);
  const pwInput = document.createElement('input');
  pwInput.type = 'password';
  pwInput.className = 'auth-gate__input';
  pwInput.placeholder = '********';
  pwInput.autocomplete = 'current-password';
  pwField.appendChild(pwInput);
  card.appendChild(pwField);

  const msg = document.createElement('div');
  msg.className = 'auth-gate__msg';
  card.appendChild(msg);

  const actions = document.createElement('div');
  actions.className = 'auth-gate__actions';

  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.className = 'auth-gate__btn auth-gate__btn--primary';
  loginBtn.appendChild(createIcon('check', 14));
  const lt = document.createElement('span');
  lt.textContent = 'ENTRAR';
  loginBtn.appendChild(lt);
  actions.appendChild(loginBtn);

  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.className = 'auth-gate__btn';
  createBtn.appendChild(createIcon('sparkles', 14));
  const ct = document.createElement('span');
  ct.textContent = 'CRIAR CONTA';
  createBtn.appendChild(ct);
  actions.appendChild(createBtn);

  card.appendChild(actions);

  const setMsg = (text: string, kind: 'ok' | 'err' | 'info'): void => {
    msg.textContent = text;
    msg.className = 'auth-gate__msg auth-gate__msg--' + kind;
  };

  const validate = (): boolean => {
    const email = emailInput.value.trim();
    const pw = pwInput.value;
    if (!email.includes('@') || email.length < 5) { setMsg('Email invalido.', 'err'); return false; }
    if (pw.length < 6) { setMsg('Password com minimo 6 caracteres.', 'err'); return false; }
    return true;
  };

  const setLoading = (loading: boolean): void => {
    loginBtn.disabled = loading;
    createBtn.disabled = loading;
  };

  loginBtn.addEventListener('click', () => {
    if (!validate()) return;
    setLoading(true);
    setMsg('A entrar...', 'info');
    void (async (): Promise<void> => {
      const r = await signIn(emailInput.value.trim(), pwInput.value);
      setLoading(false);
      if (r.ok && r.user) {
        setMsg('Login efetuado!', 'ok');
        setTimeout(() => onAuth(r.user!.id), 400);
      } else {
        setMsg(r.message, 'err');
      }
    })();
  });

  createBtn.addEventListener('click', () => {
    if (!validate()) return;
    setLoading(true);
    setMsg('A criar conta...', 'info');
    const email = emailInput.value.trim();
    void (async (): Promise<void> => {
      const r = await signUp(email, pwInput.value);
      setLoading(false);
      if (r.ok) {
        const session = await getSession();
        if (session && session.user) {
          setMsg('Conta criada! A entrar...', 'ok');
          setTimeout(() => onAuth(session.user.id), 400);
        } else {
          onVerify(email);
        }
      } else {
        setMsg(r.message, 'err');
      }
    })();
  });

  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
  emailInput.focus();
}

function renderVerifyEmail(card: HTMLElement, email: string, onBack: () => void): void {
  card.appendChild(buildLogo());

  const iconBox = document.createElement('div');
  iconBox.className = 'auth-gate__icon';
  iconBox.appendChild(createIcon('scroll', 56));
  card.appendChild(iconBox);

  const title = document.createElement('div');
  title.className = 'auth-gate__verify-title';
  title.textContent = 'VERIFICA O TEU EMAIL';
  card.appendChild(title);

  const text = document.createElement('div');
  text.className = 'auth-gate__verify-text';
  text.innerHTML = 'Enviámos um link de confirmação para <b>' + email + '</b>.<br><br>Clica no link desse email para ativar a conta.<br>Depois volta aqui e faz login.';
  card.appendChild(text);

  const hint = document.createElement('div');
  hint.className = 'auth-gate__verify-hint';
  hint.textContent = 'Nao recebeste? Ve a pasta Spam. Se demorar mais de 5 minutos, tenta novamente.';
  card.appendChild(hint);

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'auth-gate__btn';
  back.appendChild(createIcon('chevron-down', 14));
  const bt = document.createElement('span');
  bt.textContent = 'VOLTAR AO LOGIN';
  back.appendChild(bt);
  back.addEventListener('click', onBack);
  card.appendChild(back);
}