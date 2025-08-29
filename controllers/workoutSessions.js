const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const workoutSessions = await prisma.workoutSession.findMany({
    where: { userId },
    include: {
      sessionExercises: {
        include: {
          exerciseSets: {
            orderBy: { setNumber: "asc" },
          },
          exercise: true,
        },
        orderBy: { position: "asc" },
      },
      workoutTemplate: true,
    },
    orderBy: { finishedAt: "desc" },
  });
  res.status(200).json({
    message: "Workout Sessions successfully retrieved",
    workoutSessions, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const workoutSessionId = req.validated.params.workoutSessionId;

  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id: workoutSessionId, userId },
    include: {
      sessionExercises: {
        include: {
          exerciseSets: {
            orderBy: { setNumber: "asc" },
          },
          exercise: true,
        },
        orderBy: { position: "asc" },
      },
      workoutTemplate: true,
    },
  });

  if (!workoutSession)
    return res.status(404).json({ error: "Workout Session not found" });

  res.status(200).json({
    message: "Workout Session successfully retrieved",
    workoutSession,
  });
};

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { workoutTemplateId, startedAt, finishedAt, sessionExercises } =
    req.validated.body;

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId,
      workoutTemplateId,
      startedAt,
      finishedAt,
      sessionExercises: {
        create: sessionExercises.map((se) => ({
          exerciseId: se.exerciseId,
          position: se.position,
          exerciseSets: {
            create: se.exerciseSets.map((es) => ({
              setNumber: es.setNumber,
              reps: es.reps,
              weight: es.weight,
              completed: es.completed,
            })),
          },
        })),
      },
    },
    include: {
      sessionExercises: {
        include: {
          exerciseSets: {
            orderBy: { setNumber: "asc" },
          },
          exercise: true,
        },
        orderBy: { position: "asc" },
      },
      workoutTemplate: true,
    },
  });

  res.status(201).json({
    message: "Workout Session successfully created",
    workoutSession,
  });
};

exports.update = async (req, res) => {
  // sessionExercises/exerciseSets ommited: leave them unchanged
  // sessionExercises/exerciseSets []: clear the existing values
  // sessionExercises/exerciseSets valid array: replace with given values

  const userId = req.user.id;
  const workoutSessionId = req.validated.params.workoutSessionId;
  const { sessionExercises, ...fieldsToUpdate } = req.validated.body;

  // Check session exists and belongs to user
  const existingWorkoutSession = await prisma.workoutSession.findFirst({
    where: { id: workoutSessionId, userId },
  });
  if (!existingWorkoutSession)
    return res.status(404).json({ error: "Workout Session not found" });

  // Perform the update
  const updatedWorkoutSession = await prisma.workoutSession.update({
    where: { id: workoutSessionId },
    data: {
      ...fieldsToUpdate,
      sessionExercises:
        sessionExercises === undefined
          ? undefined
          : {
              deleteMany: {},
              create: sessionExercises.map((se) => ({
                exerciseId: se.exerciseId,
                position: se.position,
                exerciseSets:
                  se.exerciseSets === undefined
                    ? undefined
                    : {
                        create: se.exerciseSets.map((es) => ({
                          setNumber: es.setNumber,
                          reps: es.reps,
                          weight: es.weight,
                          completed: es.completed,
                        })),
                      },
              })),
            },
    },
    include: {
      sessionExercises: {
        include: {
          exerciseSets: {
            orderBy: { setNumber: "asc" },
          },
          exercise: true,
        },
        orderBy: { position: "asc" },
      },
      workoutTemplate: true,
    },
  });

  res.status(200).json({
    message: "Workout Session successfully updated",
    workoutSession: updatedWorkoutSession,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const workoutSessionId = req.validated.params.workoutSessionId;
  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id: workoutSessionId, userId },
  });
  if (!workoutSession)
    return res.status(404).json({ error: "Workout Session not found" });
  await prisma.workoutSession.delete({ where: { id: workoutSessionId } });
  res.status(200).json({
    message: "Workout Session successfully deleted",
    workoutSession,
  });
};
