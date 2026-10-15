// src/ui/account-panel.ts
// Painel de conta: login, registo, logout.
// Sem subscricoes globais para nao causar leaks.

import type { GameServices } from '../services/game-services';
import type { User } from '@supabase/supabase-js';
import { renderPanelHeader } from './panel-header';
import { createIcon } from './icons';
import { signUp, signIn, signOut, getCurrentUser } from '../auth/session';
import { isSupabaseConfigured } from '../auth/supabase';

export function renderAccountPanel(_services: GameServices): HTMLElement {
  void _services;

  const root = document.createElement('div');
  root.className = 'panel-content account-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'user',
    title: 'Conta',
    subtitle: 'Faz login para guardar o teu progresso na cloud',
  }));

  if (!isSupabaseConfigured()) {
    const warn = document.createElement('div');
    warn.className = 'account-warn';
    warn.textContent = 'Supabase nao configurado. Verifica o ficheiro .env.local na raiz do projeto.';
    root.appendChild(warn);
    return root;
  }

  const box = document.createElement('div');
  box.className = 'account-box';
  root.appendChild(box);

  void refresh(box);
  return root;
}

async function refresh(box: HTMLElement): Promise<void> {
  box.innerHTML = '';
  const user = await getCurrentUser();
  if (user) {
    box.appendChild(buildLoggedIn(user, () => { void refresh(box); }));
  } else {
    box.appendChild(buildLoginForm(() => { void refresh(box); }));
  }
}

// ============================================================
// Form (nao logado)
// ============================================================
function buildLoginForm(onSuccess: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'account-card';

  const title = document.createElement('div');
  title.className = 'account-card__title';
  title.textContent = 'ENTRAR OU CRIAR CONTA';
  card.appendChild(title);

  const info = document.createElement('div');
  info.className = 'account-card__info';
  info.textContent = 'O save fica guardado na cloud. Podes formatar o PC, mudar de browser ou jogar no telemovel com a mesma conta.';
  card.appendChild(info);

  const form = document.createElement('div');
  form.className = 'account-form';

  const emailField = document.createElement('div');
  emailField.className = 'account-field';
  const emailLabel = document.createElement('div');
  emailLabel.className = 'account-field__label';
  emailLabel.textContent = 'Email';
  emailField.appendChild(emailLabel);
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.className = 'account-input';
  emailInput.placeholder = 'o.teu.email@exemplo.com';
  emailInput.autocomplete = 'email';
  emailField.appendChild(emailInput);
  form.appendChild(emailField);

  const pwField = document.createElement('div');
  pwField.className = 'account-field';
  const pwLabel = document.createElement('div');
  pwLabel.className = 'account-field__label';
  pwLabel.textContent = 'Password (minimo 6 caracteres)';
  pwField.appendChild(pwLabel);
  const pwInput = document.createElement('input');
  pwInput.type = 'password';
  pwInput.className = 'account-input';
  pwInput.placeholder = '••••••••';
  pwInput.autocomplete = 'current-password';
  pwField.appendChild(pwInput);
  form.appendChild(pwField);

  const msg = document.createElement('div');
  msg.className = 'account-msg';
  form.appendChild(msg);

  const actions = document.createElement('div');
  actions.className = 'account-actions';

  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.className = 'account-btn account-btn--primary';
  loginBtn.appendChild(createIcon('check', 14));
  const l1 = document.createElement('span');
  l1.textContent = 'ENTRAR';
  loginBtn.appendChild(l1);
  actions.appendChild(loginBtn);

  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.className = 'account-btn';
  createBtn.appendChild(createIcon('sparkles', 14));
  const l2 = document.createElement('span');
  l2.textContent = 'CRIAR CONTA';
  createBtn.appendChild(l2);
  actions.appendChild(createBtn);

  form.appendChild(actions);
  card.appendChild(form);

  const setMsg = (text: string, kind: 'ok' | 'err' | 'info'): void => {
    msg.textContent = text;
    msg.className = 'account-msg account-msg--' + kind;
  };

  const validate = (): boolean => {
    const email = emailInput.value.trim();
    const pw = pwInput.value;
    if (!email.includes('@') || email.length < 5) {
      setMsg('Email invalido.', 'err');
      return false;
    }
    if (pw.length < 6) {
      setMsg('Password com minimo 6 caracteres.', 'err');
      return false;
    }
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
      if (r.ok) {
        setMsg('Login efetuado!', 'ok');
        setTimeout(onSuccess, 400);
      } else {
        setMsg(r.message, 'err');
      }
    })();
  });

  createBtn.addEventListener('click', () => {
    if (!validate()) return;
    setLoading(true);
    setMsg('A criar conta...', 'info');
    void (async (): Promise<void> => {
      const r = await signUp(emailInput.value.trim(), pwInput.value);
      setLoading(false);
      if (r.ok) {
        setMsg(r.message, 'ok');
        setTimeout(onSuccess, 500);
      } else {
        setMsg(r.message, 'err');
      }
    })();
  });

  pwInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  return card;
}

// ============================================================
// Logged in
// ============================================================
function buildLoggedIn(user: User, onLogout: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'account-card account-card--logged';

  const badge = document.createElement('div');
  badge.className = 'account-badge account-badge--ok';
  badge.appendChild(createIcon('check', 14));
  const bt = document.createElement('span');
  bt.textContent = 'SESSAO ATIVA';
  badge.appendChild(bt);
  card.appendChild(badge);

  const avatar = document.createElement('div');
  avatar.className = 'account-avatar';
  avatar.appendChild(createIcon('user', 56));
  card.appendChild(avatar);

  const email = document.createElement('div');
  email.className = 'account-email';
  email.textContent = user.email ?? 'sem email';
  card.appendChild(email);

  const lines = document.createElement('div');
  lines.className = 'account-lines';
  lines.appendChild(infoLine('ID', user.id ? user.id.slice(0, 12) + '...' : '-'));
  lines.appendChild(infoLine('Criado em', user.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT') : '-'));
  lines.appendChild(infoLine('Cloud save', 'sincronizado em breve'));
  card.appendChild(lines);

  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'account-btn account-btn--danger';
  logout.appendChild(createIcon('close', 14));
  const lt = document.createElement('span');
  lt.textContent = 'SAIR';
  logout.appendChild(lt);
  logout.addEventListener('click', () => {
    void (async (): Promise<void> => {
      await signOut();
      onLogout();
    })();
  });
  card.appendChild(logout);

  return card;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'account-line';
  const l = document.createElement('span');
  l.className = 'account-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'account-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}