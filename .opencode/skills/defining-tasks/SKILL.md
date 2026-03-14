---
name: defining-tasks
description: Use when defining tasks in any task tracking software. This is useful when planning or defining what to do next or work that was missed.
---

# How to define a task
1. Ensure that the task has a concise and descriptive title. It should be formatted like: <Main task> - <Elaboration>
2. Ensure that the task has a description that follows the task description template below.
3. Any task that requires multiple things to be completed and verified, should be split into subtasks with their own titles and descriptions.
   - e.g - A login form would need the form and the business logic to connect it to the API - these should be 2 different tasks.
4. Keep tasks SMART:
   - S: Specific
   - M: Measurable
   - A: Achievable
   - R: Relevant
   - T: Time-bound
5. If the task at hand requires many smaller steps, consider making it an epic.

---

```TASK TEMPLATE.md
Title: 
Authentication - Login form

Description:
# What are we doing?
<!-- describe what we are building, any prerequisite context, and write the steps for the task here - e.g we are building a login form for users, it is just the form that defines a clear interface for business logic to be built in <ticket-reference> -->

# Why are we doing it?
<!-- here we need to define why we are doing it. If this is not clear, the task should not be worked on - e.g users need to have a secure login experience -->

# What is the defninition of done?
<!-- here we define the acceptance criteria - e.g the user can log in with a username and password -->
```