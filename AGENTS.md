# AGENTS.md - Development Guide for Agentic Coding

This file provides guidelines for agentic coding agents working in the NVIDIA RAG repository.

## Project Overview

This is a Python-based RAG (Retrieval Augmented Generation) application with a React frontend. The backend uses FastAPI, LangChain, Milvus, and NVIDIA NIM endpoints.

---

## Build, Lint, and Test Commands

### Python Backend

```bash
# Install dependencies (uses uv)
pip install -e ".[all]"        # Install all optional dependencies
pip install -e ".[rag]"       # Install RAG dependencies only
pip install -e ".[ingest]"     # Install ingestion dependencies

# Linting and formatting (uses Ruff)
ruff check --fix src/          # Check and auto-fix lint issues
ruff format src/               # Format code

# Pre-commit hooks (recommended)
pre-commit install             # Install git hooks
pre-commit run --all-files      # Run on all files

# Running Python tests
pytest                         # Run all tests
pytest tests/unit/             # Run unit tests only
pytest tests/integration/      # Run integration tests
pytest -x                     # Stop on first failure
pytest -v                     # Verbose output
pytest -k "test_name"          # Run tests matching pattern
pytest tests/unit/test_file.py::test_function  # Run single test
pytest --cov=src              # With coverage

# Type checking (mypy if configured)
```

### Frontend (React/TypeScript)

```bash
cd frontend

# Install dependencies
pnpm install

# Development
pnpm dev                      # Start dev server
pnpm build                    # Build for production
pnpm lint                     # Run ESLint
pnpm preview                  # Preview production build

# Testing
pnpm test                     # Run tests (watch mode)
pnpm test:run                 # Run tests once (CI mode)
pnpm test:watch               # Watch mode
pnpm test:coverage            # With coverage
pnpm test:ui                  # Open Vitest UI
pnpm test:run src/components/__tests__/Component.test.tsx  # Single test file
```

---

## Code Style Guidelines

### License Header

Every source file must include the Apache 2.0 license header:

```python
# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
```

### Python Conventions

**Imports (using isort via Ruff):**
- Standard library imports first
- Third-party imports second
- Local/relative imports last
- Use absolute imports from package: `from nvidia_rag.rag_server.main import NvidiaRAG`

```python
import logging
import os
from typing import Any

import pydantic
from fastapi import FastAPI

from nvidia_rag.rag_server.health import check_all_services_health
from nvidia_rag.utils.configuration import NvidiaRAGConfig
```

**Formatting (Ruff):**
- Line length: 88 characters
- Quote style: double quotes
- Indent: 4 spaces
- Trailing commas where sensible

**Type Hints:**
- Use Python 3.11+ syntax (e.g., `list[str]` not `List[str]`)
- Use `X | None` instead of `Optional[X]`
- Include return types for all functions

```python
def process_documents(docs: list[Document], top_k: int | None = None) -> list[dict[str, Any]]:
```

**Naming:**
- Classes: `PascalCase` (e.g., `NvidiaRAG`, `APIError`)
- Functions/methods: `snake_case` (e.g., `generate_answer`, `_internal_method`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_COLLECTION_NAMES`)
- Private methods: prefix with underscore (e.g., `_rag_chain`)

**Error Handling:**
- Use custom exception classes with status codes:

```python
class APIError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        if status_code is None:
            status_code = ErrorCodeMapping.BAD_REQUEST
        self.message = message
        self.status_code = status_code
        super().__init__(message)
```

- Always chain exceptions: `raise ValueError("msg") from e`
- Use `logger.error()` for errors, `logger.warning()` for warnings

**Pydantic Models:**
- Use Pydantic v2 `BaseModel` for data validation
- Use `Field` for descriptions and constraints

```python
class RAGRequest(BaseModel):
    query: str = Field(..., description="User query string")
    top_k: int = Field(default=5, ge=1, le=100)
```

### Frontend Conventions (React/TypeScript)

**TypeScript:**
- Use strict mode
- Prefer interfaces for object shapes
- Use `type` for unions, primitives

**Components:**
- Use functional components with hooks
- Co-locate tests: `Component.tsx` and `Component.test.tsx` in same directory
- Use `@/` path alias for imports

**Testing (Vitest + React Testing Library):**
- Query priority: role > label > text > testId
- Use `userEvent` for interactions
- Mock external dependencies with `vi.mock()`

---

## Project Structure

```
src/nvidia_rag/
├── rag_server/           # FastAPI server endpoints
│   ├── main.py          # NvidiaRAG core class
│   ├── server.py        # FastAPI app setup
│   ├── validation.py    # Input validation
│   └── ...
├── utils/               # Utility modules
│   ├── vdb/            # Vector database operations
│   ├── llm.py          # LLM utilities
│   └── configuration.py
└── ingestor_server/      # Document ingestion service

frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   └── test/           # Test utilities
└── package.json
```

---

## Key Dependencies

- **Python**: 3.11-3.13
- **Backend**: FastAPI, LangChain, LangChain-NVIDIA, Pydantic, Milvus
- **Frontend**: React 19, TypeScript, Vite, Vitest, React Query, Zustand

---

## Common Development Tasks

```bash
# Run backend with auto-reload
uvicorn nvidia_rag.rag_server.server:app --reload --port 8000

# Run frontend dev server
cd frontend && pnpm dev

# Run full test suite locally
pytest tests/unit/ -v && cd frontend && pnpm test:run

# Check code quality
ruff check src/ && ruff format --check src/
```
