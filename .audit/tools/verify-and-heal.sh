#!/bin/sh
# verify-and-heal.sh
#
# Run by Sonnet AFTER committing and BEFORE writing READY.txt.
# Detects post-commit working-copy corruption and auto-heals it from HEAD.
#
# What this does:
#   1. For every file in the last commit, compare on-disk SHA to HEAD SHA.
#      If they differ, the working copy has been corrupted after commit.
#      Auto-restore via `git checkout --`. Commit itself is untouched.
#   2. For every .astro file in the last commit, verify it ends with
#      `</ApplicationLayout>` followed by a newline. If truncated, auto-heal.
#   3. Report other dirty files (not in last commit) as warnings - those
#      are legitimate work-in-progress and must be handled by the human.
#
# Exit codes:
#   0 - clean working tree (possibly after healing)
#   1 - unresolvable dirty state (uncommitted real changes, or heal failed)
#   2 - not in a git repo / run from wrong directory
#
# Log: .audit/_diagnostic/verify-and-heal.log

set -e

# Must run from repo root
if [ ! -d .git ]; then
  echo "ERROR: .git directory not found. Run from repo root." >&2
  exit 2
fi

DIAG_DIR=".audit/_diagnostic"
mkdir -p "$DIAG_DIR"
LOGFILE="$DIAG_DIR/verify-and-heal.log"
STAMP=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S)
COMMIT=$(git rev-parse HEAD)
HEALED_COUNT=0
UNHEALED_COUNT=0

{
  echo "========================================"
  echo "verify-and-heal @ $STAMP"
  echo "HEAD: $COMMIT"
} >> "$LOGFILE"

# ---------------------------------------------------------------------------
# Step 1: Files in the last commit - any drift from HEAD = corruption
# ---------------------------------------------------------------------------

COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)

for f in $COMMIT_FILES; do
  if [ ! -f "$f" ]; then
    # File was deleted in the commit - skip
    continue
  fi

  DISK_SHA=$(git hash-object "$f" 2>/dev/null)
  HEAD_SHA=$(git rev-parse "HEAD:$f" 2>/dev/null)

  if [ "$DISK_SHA" != "$HEAD_SHA" ]; then
    DISK_SIZE=$(wc -c < "$f")
    echo "  DRIFT: $f (disk=$DISK_SHA head=$HEAD_SHA size=${DISK_SIZE}B) - auto-healing" >> "$LOGFILE"
    echo "verify-and-heal: restoring $f from HEAD (working copy corrupted after commit)"
    if git checkout -- "$f" 2>>"$LOGFILE"; then
      HEALED_COUNT=$((HEALED_COUNT + 1))
      echo "    OK: restored from HEAD" >> "$LOGFILE"
    else
      UNHEALED_COUNT=$((UNHEALED_COUNT + 1))
      echo "    FAIL: git checkout failed" >> "$LOGFILE"
    fi
  fi
done

# ---------------------------------------------------------------------------
# Step 2: .astro files in last commit must end with </ApplicationLayout>\n
#         or </Layout>\n (handles pages using either layout)
# ---------------------------------------------------------------------------

for f in $COMMIT_FILES; do
  case "$f" in
    *.astro) ;;
    *) continue ;;
  esac

  if [ ! -f "$f" ]; then
    continue
  fi

  LAST_LINE=$(tail -n 1 "$f")
  # Accept </ApplicationLayout>, </Layout>, or any </...Layout> closing tag
  case "$LAST_LINE" in
    *"</ApplicationLayout>"*) ok=1 ;;
    *"</Layout>"*)            ok=1 ;;
    *"</"*"Layout>"*)         ok=1 ;;
    *)                        ok=0 ;;
  esac

  # Also require the file to end with a newline (POSIX text file rule)
  LAST_BYTE=$(tail -c 1 "$f" | od -An -c | tr -d ' ')
  if [ "$LAST_BYTE" != "\\n" ]; then
    ok=0
  fi

  if [ "$ok" = "0" ]; then
    echo "  TRUNCATED: $f (last line: $LAST_LINE) - auto-healing" >> "$LOGFILE"
    echo "verify-and-heal: $f is truncated (missing closing layout tag or newline) - restoring from HEAD"
    if git checkout -- "$f" 2>>"$LOGFILE"; then
      HEALED_COUNT=$((HEALED_COUNT + 1))
      echo "    OK: restored from HEAD" >> "$LOGFILE"
    else
      UNHEALED_COUNT=$((UNHEALED_COUNT + 1))
      echo "    FAIL: git checkout failed" >> "$LOGFILE"
    fi
  fi
done

# ---------------------------------------------------------------------------
# Step 3: Report any remaining dirty files - only a warning. These are files
#         NOT in the last commit, so they represent intentional in-progress
#         work or truly dirty state. We don't auto-heal these.
# ---------------------------------------------------------------------------

DIRTY=$(git status --porcelain)
if [ -n "$DIRTY" ]; then
  # Filter out untracked files (they're not blockers for an audit handoff)
  REAL_DIRTY=$(git status --porcelain | grep -v '^??' || true)
  if [ -n "$REAL_DIRTY" ]; then
    echo "  WARNING: working tree still has modifications after heal:" >> "$LOGFILE"
    echo "$REAL_DIRTY" | sed 's/^/    /' >> "$LOGFILE"
    echo ""
    echo "verify-and-heal: WARNING - working tree still dirty after heal pass:"
    echo "$REAL_DIRTY"
    echo ""
    echo "These files were NOT in the last commit, so they are likely"
    echo "intentional work-in-progress. Review before submitting READY.txt."
    UNHEALED_COUNT=$((UNHEALED_COUNT + 1))
  fi
fi

{
  echo "  summary: healed=$HEALED_COUNT unhealed=$UNHEALED_COUNT"
  echo ""
} >> "$LOGFILE"

# ---------------------------------------------------------------------------
# Exit
# ---------------------------------------------------------------------------

if [ "$UNHEALED_COUNT" -gt 0 ]; then
  echo ""
  echo "verify-and-heal: FAIL - see $LOGFILE for details"
  echo "DO NOT write READY.txt until working tree is clean."
  exit 1
fi

if [ "$HEALED_COUNT" -gt 0 ]; then
  echo ""
  echo "verify-and-heal: HEALED $HEALED_COUNT file(s) from HEAD. Working tree now clean."
  echo "Safe to write READY.txt. (Corruption events logged to $LOGFILE)"
else
  echo "verify-and-heal: OK - working tree matches HEAD. Safe to write READY.txt."
fi

exit 0
