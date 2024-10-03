"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react";
import axios from "axios";
import Cookie from "js-cookie";
import ReactMarkdown from "react-markdown";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import React from "react";
import { signIn, useSession } from "next-auth/react";
Chart.register(CategoryScale);

const returnRandomColor = () => {
  // 濃くて見やすい色をHSVで生成.
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const v = Math.floor(Math.random() * 100);
  if (v < 25) return `hsl(${h},${s}%,${v}%)`;
  return `hsl(${h},${s}%,${v - 25}%)`;
};

const colors: string[] = [];
for (let i = 0; i < 25; i++) {
  colors.push(returnRandomColor());
}
const AllCountGraphWeek = (props: { mySessions: Session[] }) => {
  const { mySessions } = props;
  const today = new Date();
  const weekLabels = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weekLabels.push(date.toLocaleDateString());
  }
  weekLabels.reverse();
  // finish or interrupt.
  const weekFinishedSessions = [0, 0, 0, 0, 0, 0, 0];
  const weekInterruptedSessions = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = weekLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      if (session.is_interrupted) {
        weekInterruptedSessions[index] += 1;
      } else {
        weekFinishedSessions[index] += 1;
      }
    }
  }
  return (
    <Bar
      data={{
        labels: weekLabels,
        datasets: [
          {
            label: "完了",
            data: weekFinishedSessions,
            backgroundColor: "#059bff",
            borderColor: "#059bff",
            borderWidth: 1,
            stack: "1",
          },
          {
            label: "中断",
            data: weekInterruptedSessions,
            backgroundColor: "#ff6384",
            borderColor: "#ff6384",
            borderWidth: 1,
            stack: "1",
          },
        ],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};
const AllCountGraphMonth = (props: { mySessions: Session[] }) => {
  const { mySessions } = props;
  const today = new Date();
  const monthLabels = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    monthLabels.push(date.toLocaleDateString());
  }
  monthLabels.reverse();
  // finish or interrupt.
  const monthFinishedSessions: number[] = [];
  const monthInterruptedSessions: number[] = [];
  for (let i = 0; i < 30; i++) {
    monthFinishedSessions.push(0);
    monthInterruptedSessions.push(0);
  }
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = monthLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      if (session.is_interrupted) {
        monthInterruptedSessions[index] += 1;
      } else {
        monthFinishedSessions[index] += 1;
      }
    }
  }
  return (
    <Bar
      data={{
        labels: monthLabels,
        datasets: [
          {
            label: "完了",
            data: monthFinishedSessions,
            backgroundColor: "#059bff",
            borderColor: "#059bff",
            borderWidth: 1,
            stack: "1",
          },
          {
            label: "中断",
            data: monthInterruptedSessions,
            backgroundColor: "#ff6384",
            borderColor: "#ff6384",
            borderWidth: 1,
            stack: "1",
          },
        ],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};
const AllTimeGraphWeek = (props: { mySessions: Session[] }) => {
  const { mySessions } = props;
  const today = new Date();
  const weekLabels = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weekLabels.push(date.toLocaleDateString());
  }
  weekLabels.reverse();
  const weekSessionsSum = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = weekLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      weekSessionsSum[index] += (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    }
  }
  return (
    <Bar
      data={{
        labels: weekLabels,
        datasets: [
          {
            label: "時間(h)",
            data: weekSessionsSum,
            backgroundColor: "#059bff",
            borderColor: "#059bff",
            borderWidth: 1,
            stack: "1",
          },
        ],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};
const AllTimeGraphMonth = (props: { mySessions: Session[] }) => {
  const { mySessions } = props;
  const today = new Date();
  const monthLabels = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    monthLabels.push(date.toLocaleDateString());
  }
  monthLabels.reverse();
  const monthSessionsSum: number[] = [];
  for (let i = 0; i < 30; i++) {
    monthSessionsSum.push(0);
  }
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = monthLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      monthSessionsSum[index] += (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    }
  }
  return (
    <Bar
      data={{
        labels: monthLabels,
        datasets: [
          {
            label: "時間(h)",
            data: monthSessionsSum,
            backgroundColor: "#059bff",
            borderColor: "#059bff",
            borderWidth: 1,
            stack: "1",
          },
        ],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};
const AllTagsGraphWeek = (props: { mySessions: Session[]; myTags: Tag[] }) => {
  const { mySessions, myTags } = props;
  const today = new Date();
  const weekLabels = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weekLabels.push(date.toLocaleDateString());
  }
  weekLabels.reverse();
  const tagMap = new Map<string, number[]>();
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = weekLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      if (tagMap.has(session.tag_id)) {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        tagMap.set(
          session.tag_id,
          tagMap.get(session.tag_id)!.map((v, i) => (i === index ? v + sum : v))
        );
      } else {
        const arr = Array(7).fill(0);
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        arr[index] = sum;
        tagMap.set(session.tag_id, arr);
      }
    }
  }
  // datasetsの形に変換.
  const datasets: any[] = [];
  let colorIndex = 0;
  tagMap.forEach((value, key) => {
    const tag = myTags.find((tag) => tag.id === key);
    const color = colors[colorIndex];
    colorIndex += 1;
    if (tag) {
      datasets.push({
        label: tag.tag_name,
        data: value,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      });
    } else {
      datasets.push({
        label: "Non TagName",
        data: value,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      });
    }
  });
  // datasetsをdataの値順にソート.
  datasets.sort((a, b) => {
    return a.data.reduce((prev: number, current: number) => prev + current) - b.data.reduce((prev: number, current: number) => prev + current);
  });
  return (
    <Line
      data={{
        labels: weekLabels,
        datasets: [...datasets],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};
const AllTagsGraphMonth = (props: { mySessions: Session[]; myTags: Tag[] }) => {
  const { mySessions, myTags } = props;
  const today = new Date();
  const monthLabels = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    monthLabels.push(date.toLocaleDateString());
  }
  monthLabels.reverse();
  const tagMap = new Map<string, number[]>();
  for (let i = 0; i < mySessions.length; i++) {
    const session = mySessions[i];
    if (session.end_time === null || session.is_break) continue;
    const date = new Date(session.start_time);
    const index = monthLabels.indexOf(date.toLocaleDateString());
    if (index !== -1) {
      if (tagMap.has(session.tag_id)) {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        tagMap.set(
          session.tag_id,
          tagMap.get(session.tag_id)!.map((v, i) => (i === index ? v + sum : v))
        );
      } else {
        const arr = Array(30).fill(0);
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        arr[index] = sum;
        tagMap.set(session.tag_id, arr);
      }
    }
  }
  // datasetsの形に変換.
  const datasets: any[] = [];
  let colorIndex = 0;
  tagMap.forEach((value, key) => {
    const tag = myTags.find((tag) => tag.id === key);
    const color = colors[colorIndex];
    colorIndex += 1;
    if (tag) {
      datasets.push({
        label: tag.tag_name,
        data: value,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      });
    } else {
      datasets.push({
        label: "Non TagName",
        data: value,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      });
    }
  });
  datasets.sort((a, b) => {
    return a.data.reduce((prev: number, current: number) => prev + current) - b.data.reduce((prev: number, current: number) => prev + current);
  });
  return (
    <Line
      data={{
        labels: monthLabels,
        datasets: [...datasets],
      }}
      options={{
        indexAxis: "x",
      }}
    />
  );
};

const login = async (
  tellproID: string,
  hostname: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setCurrentTellproID: React.Dispatch<React.SetStateAction<string>>,
  setIsSentTellproID: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSendingTellproID: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setErrorMessage("");
  setIsSendingTellproID(true);
  // a-zA-Z0-9-
  if (!tellproID.match(/^[a-zA-Z0-9-]+$/)) {
    setErrorMessage("TellProIDは半角英数字とハイフンのみ使用できます.");
    return;
  }
  let url = "";
  if (hostname === "localhost") url = "https://localhost:3000";
  else url = "https://www.tellpro.net";
  const data = await axios.post(url + "/api/pomosk/login_account", { tellproID });
  if (data.data.ok) {
    setIsSentTellproID(true);
    setCurrentTellproID(tellproID);
  } else {
    setErrorMessage("TellProIDが間違っています.");
  }
  setIsSendingTellproID(false);
};

const checkOneTimePass = async (
  passKey: string,
  hostname: string,
  currentTellproID: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setIsSendingPassKey: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsSendingPassKey(true);
  setErrorMessage("");
  let url = "";
  if (hostname === "localhost") url = "https://localhost:3000";
  else url = "https://www.tellpro.net";
  const data = await axios.post(url + "/api/pomosk/check_onetime", { passKey, currentTellproID });
  if (data.data.ok) {
    Cookie.set("pomosk_login_token", data.data.loginKey, { expires: 30 });
    setIsLogin(true);
    setIsOpen(false);
    window.location.reload();
  } else {
    setErrorMessage("ワンタイムパスワードが間違っています.");
  }
  setIsSendingPassKey(false);
};

interface Tag {
  id: string;
  user_id: string;
  tag_name: string;
  created_at: string;
}

interface Task {
  id: string;
  user_id: string;
  task_name: string;
  created_at: string;
}

interface Session {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  is_interrupted: boolean;
  is_break: boolean;
  tag_id: string;
}

function App() {
  // home states.
  const [isOpen, setIsOpen] = useState(false);
  const [isSentTellproID, setIsSentTellproID] = useState(false);
  const [isSendingTellproID, setIsSendingTellproID] = useState(false);
  const [isSendingPassKey, setIsSendingPassKey] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(true);
  const [isStart, setIsStart] = useState(false);
  const [inputTellproID, setInputTellproID] = useState("");
  const [currentTellproID, setCurrentTellproID] = useState("");
  const [inputPassKey, setInputPassKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hostname, setHostname] = useState("");

  // main states.
  const [tellproID, setTellproID] = useState("");
  const [selectTagID, setSelectTagID] = useState("");
  const [geminiText, setGeminiText] = useState("");
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [myTags, setMyTags] = useState<Tag[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [autoPomodoro, setAutoPomodoro] = useState(true);
  const [allCountGraphCheck, setAllCountGraphCheck] = useState(false);
  const [allTimeGraphCheck, setAllTimeGraphCheck] = useState(false);
  const [allTagsGraphCheck, setAllTagsGraphCheck] = useState(false);
  const [isSendingTagAdd, setIsSendingTagAdd] = useState(false);
  const [isSendingTagDelete, setIsSendingTagDelete] = useState(false);
  const [isSendingTaskAdd, setIsSendingTaskAdd] = useState(false);
  const [isSendingTaskDelete, setIsSendingTaskDelete] = useState(false);
  const [isSendingSession, setIsSendingSession] = useState(false);
  const [now, setNow] = useState(new Date());
  const { data: session } = useSession();

  const handleChangeTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectTagID(e.target.value);
  };

  // init effect.
  useEffect(() => {
    setHostname(window.location.hostname);
    const token = Cookie.get("pomosk_login_token");
    if (token) {
      (async () => {
        let url = "";
        if (window.location.hostname === "localhost") url = "https://localhost:3000";
        else url = "https://www.tellpro.net";
        let res: any;
        try {
          res = await axios.post(url + "/api/pomosk/check_login_key", { login_token: token });
        } catch (e) {
          Cookie.remove("pomosk_login_token");
          setLoginLoading(false);
          return;
        }
        if (res.data.ok) {
          setIsLogin(true);
          setTellproID(res.data.result[0].user_id);
          setMyTags(res.data.user.tags);
          setMyTasks(res.data.user.tasks);
          setMySessions(res.data.user.sessions);
          setLoginLoading(false);

          // check not ended sessions.
          if (res.data.user.sessions.length !== 0) {
            const sessions = res.data.user.sessions as Session[];
            const mayBeNotEndedSessions = sessions.slice(-1)[0];
            if (mayBeNotEndedSessions.end_time === null) {
              const now = new Date();
              // start-now.
              const between = new Date(mayBeNotEndedSessions.start_time).getTime() - now.getTime();
              // もし25分以上経っていたら自動で終了.
              if (between / 1000 / 60 >= 25) {
                // end_time=start_time+25min.
                const end_time = new Date(mayBeNotEndedSessions.start_time);
                end_time.setMinutes(end_time.getMinutes() + 25);
                const data = await axios.post(url + "/api/pomosk/end_session", { login_token: token, sessionID: mayBeNotEndedSessions.id });
                if (!data.data.ok) {
                  alert("セッションの終了に失敗しました.");
                }
                setMySessions((prev) => {
                  return prev.map((session) => {
                    if (session.id === mayBeNotEndedSessions.id) {
                      return { ...session, end_time: end_time.toISOString() };
                    } else {
                      return session;
                    }
                  });
                });
              }
            }
          }
          if (res.data.user.sessions.length !== 0) {
            // geminiへのリクエスト.
            const sessions = res.data.user.sessions as Session[];
            // [{name:string,time:number}]の形でデータを作成.(nameはtag名、timeは時間(h))
            const tags = new Map<string, number>();
            sessions.forEach((session) => {
              if (session.end_time === null || session.is_break) return;
              if (tags.has(session.tag_id)) {
                const start = new Date(session.start_time);
                const end = new Date(session.end_time);
                const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
                tags.set(session.tag_id, tags.get(session.tag_id)! + sum);
              } else {
                const start = new Date(session.start_time);
                const end = new Date(session.end_time);
                const sum = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
                tags.set(session.tag_id, sum);
              }
            });
            let data: { name: string; time: number }[] = [];
            tags.forEach((value, key) => {
              const tag = res.data.user.tags.find((tag: Tag) => tag.id === key);
              if (tag) {
                data.push({ name: tag.tag_name, time: value });
              } else {
                data.push({ name: "Non TagName", time: value });
              }
            });
            const tag_data = JSON.stringify(data);
            const gemini = await axios.post(url + "/api/pomosk/gemini", { login_token: token, tag_data });
            if (gemini.data.ok) {
              setGeminiText(gemini.data.gemini_text);
            }
          }
        } else {
          Cookie.remove("pomosk_login_token");
          setLoginLoading(false);
        }
      })();
    } else {
      if (session) {
        const user = session.user;
        if (user) {
          (async () => {
            const data = await axios.post("/api/get_login_key");
            const key = data.data.key;
            Cookie.set("pomosk_login_token", key, { expires: 30 });
            window.location.reload();
          })();
        }
      }
      setLoginLoading(false);
    }
    const interval = setInterval(() => {
      setNow(new Date());
    }, 500);
    const visibilitychangeEvent = () => {
      // autoPomodoro
      if (document.visibilityState === "visible") {
        setAutoPomodoro(true);
      }
      if (document.visibilityState === "hidden") {
        setAutoPomodoro(false);
      }
    };
    const focusEvent = () => {
      setAutoPomodoro(true);
    };
    const blurEvent = () => {
      setAutoPomodoro(false);
    };
    document.addEventListener("visibilitychange", visibilitychangeEvent);
    document.addEventListener("focus", focusEvent);
    document.addEventListener("blur", blurEvent);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibilitychangeEvent);
      document.removeEventListener("focus", focusEvent);
      document.removeEventListener("blur", blurEvent);
    };
  }, [session]);

  useEffect(() => {
    const session = getNotFinishedSession();
    if (session.length === 0) {
      return;
    }
    // セッションが0以下になったらend.
    if (getNotFinishedSessionTime() <= 0) {
      (async () => {
        const end_time = new Date(session[0].start_time);
        if (session[0].is_break) end_time.setMinutes(end_time.getMinutes() + 5);
        else end_time.setMinutes(end_time.getMinutes() + 25);
        setMySessions((prev) => {
          return prev.map((s) => {
            if (s.id === session[0].id) {
              return { ...s, end_time: end_time.toISOString() };
            } else {
              return s;
            }
          });
        });
        let url = "";
        if (window.location.hostname === "localhost") url = "https://localhost:3000";
        else url = "https://www.tellpro.net";
        const token = Cookie.get("pomosk_login_token");
        const data = await axios.post(url + "/api/pomosk/end_session", { login_token: token, sessionID: session[0].id });
        if (!data.data.ok) {
          alert("セッションの終了に失敗しました.");
        }

        if (autoPomodoro) {
          let url = "";
          if (window.location.hostname === "localhost") url = "https://localhost:3000";
          else url = "https://www.tellpro.net";
          const token = Cookie.get("pomosk_login_token");
          const data = await axios.post(url + "/api/pomosk/start_session", { isBreak: !getNotFinishedSession()[0].is_break, tagID: selectTagID, login_token: token });
          if (data.data.ok) {
            setMySessions((prev) => {
              return [...prev, data.data.session];
            });
          } else {
            alert("セッションの開始に失敗しました.");
          }
        }
      })();
    }
  }, [now]);

  const addTag = async () => {
    const tag_name = prompt("タグ名を入力してください.");
    if (tag_name === null) {
      return;
    }
    if (tag_name === "") {
      alert("タグ名を入力してください.");
      return;
    }
    if (tag_name.length > 20) {
      alert("タグ名は20文字以内で入力してください.");
      return;
    }
    const isDuplicate = myTags.some((tag) => tag.tag_name === tag_name);
    if (isDuplicate) {
      alert("同じ名前のタグが存在します.");
      return;
    }
    if (myTags.length >= 25) {
      alert("タグは最大25個までです.");
      return;
    }
    setIsSendingTagAdd(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const data = await axios.post(url + "/api/pomosk/add_tag", { tag_name, login_token: token });
    if (data.data.ok) {
      alert("タグを追加しました.");
      const tagID = data.data.tagID;
      setMyTags((prev) => {
        return [...prev, { id: tagID, user_id: tellproID, tag_name, created_at: new Date().toISOString() }];
      });
    } else {
      alert("タグの追加に失敗しました.");
    }
    setIsSendingTagAdd(false);
  };

  const deleteTag = async () => {
    if (!window.confirm("本当に削除しますか?")) {
      return;
    }
    setIsSendingTagDelete(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const tag_id = selectTagID;
    const data = await axios.post(url + "/api/pomosk/delete_tag", { tag_id, login_token: token });
    if (data.data.ok) {
      alert("タグを削除しました.");
      setMyTags((prev) => {
        return prev.filter((tag) => tag.id !== tag_id);
      });
    } else {
      alert("タグの削除に失敗しました.");
    }
    setIsSendingTagDelete(false);
  };

  const addTask = async () => {
    const task_name = prompt("タスク名を入力してください.");
    if (task_name === null) {
      return;
    }
    if (task_name === "") {
      alert("タスク名を入力してください.");
      return;
    }
    if (task_name.length > 20) {
      alert("タスク名は20文字以内で入力してください.");
      return;
    }
    setIsSendingTaskAdd(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const data = await axios.post(url + "/api/pomosk/add_task", { task_name, login_token: token });
    if (data.data.ok) {
      const taskID = data.data.taskID;
      setMyTasks((prev) => {
        return [...prev, { id: taskID, user_id: tellproID, task_name, created_at: new Date().toISOString() }];
      });
    } else {
      alert("タスクの追加に失敗しました.");
    }
    setIsSendingTaskAdd(false);
  };

  const deleteTask = async (task_id: string) => {
    setIsSendingTaskDelete(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const data = await axios.post(url + "/api/pomosk/delete_task", { task_id, login_token: token });
    if (data.data.ok) {
      setMyTasks((prev) => {
        return prev.filter((task) => task.id !== task_id);
      });
    } else {
      alert("タスクの削除に失敗しました.");
    }
    setIsSendingTaskDelete(false);
  };

  const startSession = async (isBreak: boolean) => {
    if (getNotFinishedSession().length !== 0) {
      return;
    }
    setIsSendingSession(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const data = await axios.post(url + "/api/pomosk/start_session", { isBreak, tagID: selectTagID, login_token: token });
    if (data.data.ok) {
      setMySessions((prev) => {
        return [...prev, data.data.session];
      });
    } else {
      alert("セッションの開始に失敗しました.");
    }
    setIsSendingSession(false);
  };

  const interruptSession = async () => {
    if (getNotFinishedSession().length === 0) {
      alert("セッションが開始されていません.");
      return;
    }
    const start = new Date(getNotFinishedSession()[0].start_time);
    const now = new Date();
    if (!getNotFinishedSession()[0].is_break) {
      if (now.getTime() - start.getTime() < 1000 * 60) {
        alert("セッション開始から1分以内は中断できません.");
        return;
      }
    }
    setIsSendingSession(true);
    let url = "";
    if (window.location.hostname === "localhost") url = "https://localhost:3000";
    else url = "https://www.tellpro.net";
    const token = Cookie.get("pomosk_login_token");
    const data = await axios.post(url + "/api/pomosk/interrupt_session", { login_token: token, sessionID: getNotFinishedSession()[0].id });
    if (data.data.ok) {
      setMySessions((prev) => {
        return prev.map((session) => {
          if (session.end_time === null) {
            return { ...session, end_time: new Date().toISOString(), is_interrupted: true };
          } else {
            return session;
          }
        });
      });
    } else {
      alert("セッションの中断に失敗しました.");
    }
    setIsSendingSession(false);
  };

  const getTodaySessionMinute = () => {
    let minutes = 0;
    mySessions.forEach((session) => {
      if (session.is_break) return;
      const start = new Date(session.start_time);
      const end = session.end_time === null ? new Date() : new Date(session.end_time);
      if (start.getDate() === new Date().getDate()) {
        minutes += (end.getTime() - start.getTime()) / 1000 / 60;
      }
    });
    return Math.floor(minutes);
  };

  const getWeeksSessionMinute = () => {
    let minutes = 0;
    mySessions.forEach((session) => {
      if (session.is_break) return;
      const start = new Date(session.start_time);
      const end = session.end_time === null ? new Date() : new Date(session.end_time);
      if (start.getTime() > new Date().getTime() - 1000 * 60 * 60 * 24 * 7) {
        minutes += (end.getTime() - start.getTime()) / 1000 / 60;
      }
    });
    return Math.floor(minutes);
  };

  const getNotFinishedSession = () => {
    return mySessions.filter((session) => session.end_time === null);
  };

  const getNotFinishedSessionTime = () => {
    if (getNotFinishedSession().length === 0) return 0;
    if (getNotFinishedSession()[0].is_break) {
      const m = 5 * 60;
      const t = Math.ceil((now.getTime() - new Date(getNotFinishedSession()[0].start_time).getTime()) / 1000);
      return m - t;
    } else {
      const m = 25 * 60;
      const t = Math.ceil((now.getTime() - new Date(getNotFinishedSession()[0].start_time).getTime()) / 1000);
      return m - t;
    }
  };

  return (
    <>
      <div className="bg-white h-[68px]">
        <div className="py-4 flex px-4 my-auto items-center justify-between">
          <div className="flex justify-start text-3xl items-center">
            <img src="/Pomosk.png" alt="" width={32} height={32} />
            <span className="my-auto font-bold ml-2">Pomosk</span>
          </div>
        </div>
      </div>
      {isStart ? (
        <>
          <div className="flex justify-between px-10 flex-wrap h-[calc(100vh-68px)] items-center">
            <div className="order-1 mx-auto border-l border-r border-black px-10 my-32">
              <p className="mt-4 text-center text-4xl font-bold">タイマー</p>
              <div className="text-center text-3xl mt-2">
                <b>{tellproID}</b>のポモドーロ
              </div>
              <div className="flex justify-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setAutoPomodoro(e.target.checked);
                    }}
                    checked={autoPomodoro}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-lg font-medium text-gray-900 dark:text-gray-300 select-none">自動ポモドーロ</span>
                </label>
              </div>
              <div className="rounded-full w-64 h-64 table border-4 border-gray-500 mx-auto mt-5">
                <div className="my-auto align-middle table-cell">
                  <p className="text-center text-7xl mb-4 font-bold">
                    {mySessions.length === 0
                      ? "25:00"
                      : getNotFinishedSession().length === 0
                      ? "25:00"
                      : `${String(Math.floor(getNotFinishedSessionTime() / 60)).padStart(2, "0")}:${String(getNotFinishedSessionTime() % 60).padStart(2, "0")}`}
                  </p>
                  <p className="text-center text-xl mt-4 text-gray-700">{getNotFinishedSession().length === 0 ? "スタート前" : getNotFinishedSession()[0].is_break ? "休憩中" : "作業中"}</p>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className={`px-6 text-lg my-3 py-3 text-white rounded transition-all ${getNotFinishedSession().length === 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={() => {
                    if (getNotFinishedSession().length === 0) startSession(false);
                    else interruptSession();
                  }}
                  disabled={isSendingSession}
                >
                  {getNotFinishedSession().length === 0 ? "スタート" : "中断"}
                </button>
              </div>
            </div>
            <div className="mx-auto h-[480px]">
              <p className="mt-4 text-center text-4xl font-bold">タグ/タスク</p>
              <div className="mt-2 text-2xl flex justify-center">
                <select
                  id="tags"
                  onChange={handleChangeTag}
                  disabled={getNotFinishedSession().length !== 0}
                  className="bg-gray-50 border outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">Non TagName</option>
                  {myTags.map((tag) => {
                    return (
                      <option key={tag.id} value={tag.id}>
                        {tag.tag_name}
                      </option>
                    );
                  })}
                </select>
                <button
                  className="bg-green-500 hover:bg-green-600 transition rounded ml-2 px-4 py-2 text-white"
                  onClick={() => {
                    addTag();
                  }}
                  disabled={isSendingTagAdd}
                >
                  追加
                </button>
                <button
                  className={"bg-red-500 hover:bg-red-600 transition rounded ml-2 px-4 py-2 text-white disabled:bg-gray-400"}
                  disabled={selectTagID === "" || isSendingTagDelete}
                  onClick={() => {
                    deleteTag();
                  }}
                >
                  削除
                </button>
              </div>
              <div className="w-80 mx-auto mt-4">
                <div className="flex justify-between">
                  <div className="font-bold border h-60 rounded w-80 border-black overflow-y-auto hidden-scrollbar">
                    タスク
                    <hr className="border-black" />
                    {myTasks.map((task) => {
                      return (
                        <div key={task.id} className="text-sm">
                          {task.task_name}
                          <div className="flex justify-between my-2">
                            <button
                              className="bg-red-500 hover:bg-red-600 transition rounded mx-1 px-3 py-1 text-white"
                              onClick={() => {
                                deleteTask(task.id);
                              }}
                              disabled={isSendingTaskDelete}
                            >
                              削除
                            </button>
                          </div>
                          <hr />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex mt-4 h-10">
                  <button
                    className="bg-green-500 hover:bg-green-600 transition rounded ml-2 px-4 py-2 text-white"
                    onClick={() => {
                      addTask();
                    }}
                    disabled={isSendingTaskAdd}
                  >
                    タスク追加
                  </button>
                </div>
              </div>
            </div>
            <div className="order-2 overflow-y-scroll h-[480px] mx-auto w-96">
              <p className="mt-4 text-center text-4xl font-bold">データ</p>
              <div className="text-center text-2xl mt-5">
                今日:&thinsp;
                <b>
                  {Math.floor(getTodaySessionMinute() / 60)} 時間 {getTodaySessionMinute() % 60} 分
                </b>
              </div>
              <div className="text-center text-2xl">
                今週:&thinsp;
                <b>
                  {Math.floor(getWeeksSessionMinute() / 60)} 時間 {getWeeksSessionMinute() % 60} 分
                </b>
              </div>
              <div className="w-80 mx-auto mt-5">
                <div className="inline-flex">
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l ${allCountGraphCheck ? "" : "bg-green-400 hover:bg-green-500"}`}
                    onClick={() => {
                      setAllCountGraphCheck(false);
                    }}
                  >
                    週
                  </button>
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ${allCountGraphCheck ? "bg-green-400 hover:bg-green-500" : ""}`}
                    onClick={() => {
                      setAllCountGraphCheck(true);
                    }}
                  >
                    月
                  </button>
                </div>
                {allCountGraphCheck ? <AllCountGraphMonth mySessions={mySessions} /> : <AllCountGraphWeek mySessions={mySessions} />}
              </div>
              <div className="w-80 mx-auto mt-5">
                <div className="inline-flex">
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l ${allTimeGraphCheck ? "" : "bg-green-400 hover:bg-green-500"}`}
                    onClick={() => {
                      setAllTimeGraphCheck(false);
                    }}
                  >
                    週
                  </button>
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ${allTimeGraphCheck ? "bg-green-400 hover:bg-green-500" : ""}`}
                    onClick={() => {
                      setAllTimeGraphCheck(true);
                    }}
                  >
                    月
                  </button>
                </div>
                {allTimeGraphCheck ? <AllTimeGraphMonth mySessions={mySessions} /> : <AllTimeGraphWeek mySessions={mySessions} />}
              </div>
              <div className="w-80 mx-auto mt-5">
                <div className="inline-flex">
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l ${allTagsGraphCheck ? "" : "bg-green-400 hover:bg-green-500"}`}
                    onClick={() => {
                      setAllTagsGraphCheck(false);
                    }}
                  >
                    週
                  </button>
                  <button
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ${allTagsGraphCheck ? "bg-green-400 hover:bg-green-500" : ""}`}
                    onClick={() => {
                      setAllTagsGraphCheck(true);
                    }}
                  >
                    月
                  </button>
                </div>
                {allTagsGraphCheck ? <AllTagsGraphMonth mySessions={mySessions} myTags={myTags} /> : <AllTagsGraphWeek mySessions={mySessions} myTags={myTags} />}
              </div>
              <div className="w-80 mx-auto mt-5 rounded border border-gray-700 mb-2">
                <div className="text-center text-2xl font-bold">Geminiからのアドバイス</div>
                <div className="text-center text-lg text-gray-700">(1週間更新)</div>
                <div className="mt-3 text-center">
                  <ReactMarkdown>{geminiText}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-10 text-center min-h-screen">
            <div className="flex flex-wrap justify-evenly">
              <div className="my-auto animate-tracking-in-expand min-w-fit">
                <div className="text-2xl font-bold flex justify-center mb-5" style={{ color: "#3f8bd6" }}>
                  <img src="/Pomosk.png" alt="" width={32} height={32} className="mr-2" />
                  Pomosk
                </div>
                <div className="font-bold text-2xl md:text-5xl text-gray-800 text-center mb-5">
                  ポモドーロテクニック
                  <br />
                  タスク管理アプリ
                </div>
                <button
                  className={`px-6 text-lg my-3 py-3 bg-blue-600 text-white rounded transition-all ${loginLoading ? "bg-gray-700" : "hover:bg-blue-700"}`}
                  onClick={() => {
                    if (isLogin) {
                      setIsStart(true);
                    } else {
                      setIsSentTellproID(false);
                      setIsOpen(true);
                    }
                  }}
                  disabled={loginLoading}
                >
                  {loginLoading ? "ロード中..." : isLogin ? "始める" : "ログイン"}
                </button>
              </div>
              <img src="/timer.png" width={300} alt="" className="" />
            </div>
          </div>
          <div className="mt-10 text-center min-h-screen">
            <div className="flex flex-wrap justify-evenly animate-tracking-in-expand flex-row-reverse">
              <div className="my-auto min-w-fit">
                <div className="font-bold text-2xl md:text-5xl text-gray-800 text-center mb-5">ポモドーロテクニック</div>
                <div className="mb-3 max-w-80 mx-auto">
                  25分の作業+5分の休憩という時間を繰り返すことで、 生産性アップだけでなく、作業を分割し 1 つずつ処理していけるため、精神的な疲れも減らすことのできるテクニック
                </div>
              </div>
              <img src="/timer2.png" width={300} alt="" className="" />
            </div>
          </div>
          <div className="mt-10 min-h-screen">
            <div className="flex flex-wrap justify-evenly">
              <div className="my-auto animate-tracking-in-expand min-w-fit">
                <div className="font-bold text-2xl md:text-5xl text-gray-800 text-center mb-5">Pomosk の特徴</div>
                <div className="my-3 max-w-80 mx-auto">Pomosk は、ポモドーロテクニックを使ったタスク管理アプリです。 作業時間と休憩時間を設定し、タスクを管理することができます。</div>
              </div>
              <img src="/Pomosk.png" width={300} alt="" className="" />
            </div>
          </div>
          <div className="mt-10 text-center min-h-screen">
            <div className="flex flex-wrap justify-evenly">
              <div className="animate-tracking-in-expand min-w-fit">
                <div className="font-bold text-2xl md:text-5xl text-gray-800 text-center mb-5">chart.jsでのグラフ描画</div>
                <div className="my-3 max-w-80 mx-auto">Pomosk ではchart.jsを用いて、日頃のデータをわかりやすくビジュアライズすることができます。</div>
                <img src="/chart.js.png" width={300} alt="" className="mx-auto" />
              </div>
              <div className="animate-tracking-in-expand">
                <div className="font-bold text-2xl md:text-5xl text-gray-800 text-center mb-5">Geminiからのアドバイス</div>
                <div className="my-3 max-w-80 mx-auto">Pomosk では、自動でGemini AIからのアドバイスを取得することができます。</div>
                <img src="/Gemini.png" width={300} alt="" className="mx-auto" />
              </div>
            </div>
          </div>
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => {
                setIsOpen(false);
              }}
            >
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black/25" />
              </TransitionChild>
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        <div>ログイン</div>
                      </DialogTitle>
                      {isSentTellproID ? (
                        <>
                          <label htmlFor="pomosk_passKey" className="flex">
                            <img src="/TellPro-logo.png" alt="" width={26} height={26}></img>
                            passKey:
                            <input
                              type="text"
                              id="pomosk_passKey"
                              placeholder="ワンタイムパスワード"
                              className="outline-cyan-600 transition-all w-2/3 border border-cyan-500 focus:shadow-md rounded"
                              autoComplete="off"
                              value={inputPassKey}
                              onChange={(e) => {
                                setInputPassKey(e.target.value);
                              }}
                            />
                          </label>
                          <br />
                          <span className="text-gray-700 text-sm">TellProの右上にあるメールアイコンからワンタイムパスワードを取得できます</span>
                          <span className="text-red-600 font-bold">{errorMessage}</span>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="ml-2 transition inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 disabled:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={() => {
                                checkOneTimePass(inputPassKey, hostname, currentTellproID, setErrorMessage, setIsSendingPassKey, setIsLogin, setIsOpen);
                              }}
                              disabled={isSendingPassKey}
                            >
                              ログイン
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-4">
                            <b>TellProでログイン:</b>
                            <div className="flex">
                              <label htmlFor="pomosk_tellproID" className="flex">
                                <img src="/TellPro-logo.png" alt="" width={24} height={24}></img>
                                <input
                                  type="text"
                                  id="pomosk_tellproID"
                                  placeholder="TellProID(@以降)"
                                  className="outline-cyan-600 transition-all w-64 h-6 border border-cyan-500 focus:shadow-md rounded"
                                  autoComplete="off"
                                  value={inputTellproID}
                                  onChange={(e) => {
                                    setInputTellproID(e.target.value);
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                className="ml-4 transition rounded-md border border-transparent bg-red-100 h-6 px-3 text-sm font-medium text-red-900 hover:bg-red-200 disabled:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={() => {
                                  login(inputTellproID, hostname, setErrorMessage, setCurrentTellproID, setIsSentTellproID, setIsSendingTellproID);
                                }}
                                disabled={isSendingTellproID}
                              >
                                送信
                              </button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <b className="my-auto block">Googleでログイン:</b>
                            <button
                              className="gsi-material-button"
                              onClick={() => {
                                signIn("google", { callbackUrl: `${process.env.NEXT_PUBLIC_TRUTH_URL}` }, { prompt: "login" });
                              }}
                            >
                              <div className="gsi-material-button-state"></div>
                              <div className="gsi-material-button-content-wrapper">
                                <div className="gsi-material-button-icon">
                                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink">
                                    <path
                                      fill="#EA4335"
                                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                    ></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path
                                      fill="#34A853"
                                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                    ></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                  </svg>
                                </div>
                                <span className="gsi-material-button-contents">Sign in with Google</span>
                              </div>
                            </button>
                          </div>
                          <span className="text-red-600 font-bold">{errorMessage}</span>
                        </>
                      )}
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </>
  );
}

export default App;
