import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setField, setForm, resetForm, setSaving } from "./interactionSlice";
import { addMessage, setLoading } from "./aiSlice";

const API = "http://127.0.0.1:8000";

/* ---------------- COLORS ---------------- */

const C = {
  bg: "#F4F6FA",
  card: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#2563EB",
  text: "#0F172A",
  muted: "#64748B",
  aiPanel: "#F8FAFC"
};

/* ---------------- INPUT COMPONENTS ---------------- */

const Label = ({ children }) => (
  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5 }}>
    {children}
  </div>
);

const Input = (p) => (
  <input
    {...p}
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid " + C.border,
      borderRadius: 6
    }}
  />
);

const Select = (p) => (
  <select
    {...p}
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid " + C.border,
      borderRadius: 6
    }}
  />
);

const Textarea = (p) => (
  <textarea
    {...p}
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid " + C.border,
      borderRadius: 6,
      minHeight: 80
    }}
  />
);

/* ---------------- AI PANEL ---------------- */

function AiPanel() {

  const dispatch = useDispatch();
  const { messages, loading } = useSelector((s) => s.ai);

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {

    if (!input.trim()) return;

    const msg = input.trim();
    setInput("");

    dispatch(addMessage({ role: "user", text: msg }));
    dispatch(setLoading(true));

    try {

      const res = await fetch(API + "/ai_chat", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: msg})
      });

      const data = await res.json();

      if (data.interaction) {
        dispatch(setForm(data.interaction));
        dispatch(addMessage({ role: "ai", text: "Interaction fields filled." }));
      }

    } catch {
      dispatch(addMessage({ role: "ai", text: "Backend not reachable." }));
    }

    dispatch(setLoading(false));
  };

  return (
    <div
      style={{
        background: C.card,
        border: "1px solid " + C.border,
        borderRadius: 10,
        padding: 16,
        height: "100%"
      }}
    >

      <h3>🤖 AI Assistant</h3>

      <div
        style={{
          background: "#E0F2FE",
          padding: 10,
          borderRadius: 8,
          marginBottom: 15
        }}
      >
        Log interaction details here via chat.
      </div>

      <div style={{ height: 260, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role}:</b> {m.text}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <textarea
        placeholder="Describe interaction..."
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        style={{width:"100%", marginTop:10}}
      />

      <button
        onClick={send}
        style={{
          marginTop:8,
          width:"100%",
          padding:10,
          background:C.primary,
          color:"#fff",
          border:"none",
          borderRadius:6
        }}
      >
        {loading ? "Thinking..." : "AI Log"}
      </button>

    </div>
  );
}

/* ---------------- MAIN APP ---------------- */

export default function App() {

  const dispatch = useDispatch();
  const form = useSelector((s)=>s.interaction.form);
  const saving = useSelector((s)=>s.interaction.saving);

  const set = (k,v)=>dispatch(setField({key:k,value:v}));

  const save = async()=>{

    dispatch(setSaving(true));

    try{

      await fetch(API+"/log_interaction",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form)
      });

      dispatch(resetForm());

    }catch{}

    dispatch(setSaving(false));
  };

  return (

    <div
      style={{
        background:C.bg,
        minHeight:"100vh",
        padding:40,
        fontFamily:"Inter, sans-serif"
      }}
    >

      <h2>Log HCP Interaction</h2>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 400px",
          gap:20
        }}
      >

        {/* LEFT FORM */}

        <div
          style={{
            background:C.card,
            padding:20,
            borderRadius:10,
            border:"1px solid "+C.border
          }}
        >

          <Label>HCP Name</Label>
          <Input
            placeholder="Search or select HCP..."
            value={form.hcp_name||""}
            onChange={(e)=>set("hcp_name",e.target.value)}
          />

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:15}}>

            <div>
              <Label>Interaction Type</Label>
              <Select
                value={form.interaction_type||""}
                onChange={(e)=>set("interaction_type",e.target.value)}
              >
                <option>Meeting</option>
                <option>Call</option>
                <option>Email</option>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date||""}
                onChange={(e)=>set("date",e.target.value)}
              />
            </div>

          </div>

          <div style={{marginTop:15}}>
            <Label>Time</Label>
            <Input
              type="time"
              value={form.time||""}
              onChange={(e)=>set("time",e.target.value)}
            />
          </div>

          <div style={{marginTop:15}}>
            <Label>Attendees</Label>
            <Input
              placeholder="Enter names or search..."
              value={form.attendees||""}
              onChange={(e)=>set("attendees",e.target.value)}
            />
          </div>

          <div style={{marginTop:15}}>
            <Label>Topics Discussed</Label>
            <Textarea
              placeholder="Enter key discussion points..."
              value={form.topics_discussed||""}
              onChange={(e)=>set("topics_discussed",e.target.value)}
            />
          </div>

          {/* NEW FIELDS */}

          <div style={{marginTop:15}}>
            <Label>Materials Shared</Label>
            <Input
              placeholder="Brochure, study, leaflet..."
              value={form.materials_shared||""}
              onChange={(e)=>set("materials_shared",e.target.value)}
            />
          </div>

          <div style={{marginTop:15}}>
            <Label>Samples Distributed</Label>
            <Input
              placeholder="Enter sample details..."
              value={form.samples_distributed||""}
              onChange={(e)=>set("samples_distributed",e.target.value)}
            />
          </div>

          <div style={{marginTop:15}}>
            <Label>Observed HCP Sentiment</Label>
            <Select
              value={form.sentiment||""}
              onChange={(e)=>set("sentiment",e.target.value)}
            >
              <option value="">Select sentiment</option>
              <option>Positive</option>
              <option>Neutral</option>
              <option>Negative</option>
            </Select>
          </div>

          <div style={{marginTop:15}}>
            <Label>Outcome</Label>
            <Textarea
              placeholder="Key outcomes or agreements..."
              value={form.outcome||""}
              onChange={(e)=>set("outcome",e.target.value)}
            />
          </div>

          <div style={{marginTop:15}}>
            <Label>Follow-up Actions</Label>
            <Textarea
              placeholder="Next steps or follow-ups..."
              value={form.followup_actions||""}
              onChange={(e)=>set("followup_actions",e.target.value)}
            />
          </div>

          <button
            onClick={save}
            style={{
              marginTop:20,
              padding:"10px 20px",
              background:C.primary,
              color:"#fff",
              border:"none",
              borderRadius:6
            }}
          >
            {saving ? "Saving..." : "Save Interaction"}
          </button>

        </div>

        {/* RIGHT AI PANEL */}

        <AiPanel/>

      </div>

    </div>
  );
}