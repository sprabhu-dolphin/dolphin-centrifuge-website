# Antigravity Safety Protocol (v1.0)

⚓ **⚓ THE DISCOVERY & VERIFICATION LOCK (MANDATORY)**

This protocol was established on April 16, 2026, following a critical hallucination failure regarding page statuses. All AI agents MUST follow these steps without exception.

### **RULE 1: THE DISCOVERY LOCK (No Blind Claims)**
Before claiming a page is "Finished," "Refactored," or "Ready for next steps," the agent MUST:
1.  **Perform a raw `grep` or `view_file`** on the actual source code.
2.  **Identify the specific layout engine** (e.g., search for `grid-cols-` vs legacy `flex` or `text-center` structures).
3.  **State the findings explicitly** with line numbers before proposing any work.

### **RULE 2: THE SOURCE OF TRUTH (Git Status Only)**
Agents must NEVER rely on the "Session Summary" or human-readable logs for status reporting. 
1.  The **ONLY** source of truth for "Finished" work is the current `git status` and `git log`.
2.  If a page is not in a recent commit with the prefix `feat(v2.2):` or similar, it is considered **UNFINISHED** regardless of what a summary says.

### **RULE 3: ELI5 ERROR REPORTING**
If there is a conflict between a "Plan" and the "Actual Code," the agent must stop and report the discrepancy in ELI5 (Explain Like I'm 5) terms before proceeding.

### **RULE 4: MANDATORY MAINTENANCE OF FINISHED_PAGES_LOG.md**
To maintain a verifiable record, the following is **HARD-CODED**:
1.  **LOG UPDATES:** The agent MUST update `FINISHED_PAGES_LOG.md` immediately after every commit.
2.  **LOG SUPREMACY:** If a page is not in the log, it is **NOT FINISHED**.

### **RULE 5: STRICT BROWSER PREVIEW PROHIBITION (CRASH PREVENTION)**
1.  **NEVER OPEN THE BROWSER:** Under NO CIRCUMSTANCES is any AI agent allowed to start a browser subagent, take a screenshot, or render the site.
2.  **CRASH DANGER:** Opening the browser causes the user's PC to crash due to OOM (Out Of Memory) overload. This must be 100% guaranteed avoided.
3.  **MANDATORY USER HANDOFF:** When a visual check or "preview" is needed, the agent MUST stop and ask the user (Sanjay) to preview the page. The agent will wait for his feedback before proceeding.

### **RULE 6: STRICT SINGLE-PAGE SYNCHRONOUS WORKFLOW (NO MULTI-AGENT)**
1.  **NO PARALLEL JOBS:** To prevent destroying the Git repo and losing finished work, agents are strictly forbidden from spawning multiple background sub-agents or operating on multiple files simultaneously.
2.  **ONE AT A TIME:** You must migrate, edit, and thoroughly process exactly ONE page at a time.
3.  **STAY IN YOUR LANE:** Do not look at, index, or edit another page's code until the current page has been fully committed to Git. All work is strictly synchronous, one-by-one execution.

---
**Failure to follow this protocol results in an immediate Stop-and-Check.**
