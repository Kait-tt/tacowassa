'use strict';
const db = require('../schemes');
const _ = require('lodash');
const co = require('co');

class Task {
    static get defaultFindOption() {
        return {
            include: [
                {model: db.Stage, as: 'stage'},
                {model: db.User, as: 'user'},
                {model: db.Cost, as: 'cost'},
                {model: db.Label, as: 'labels'},
                {model: db.Work, as: 'works'}
            ]
        };
    }

    static findById(projectId, taskId, options={}) {
        return db.Task.findOne(_.defaults(options, Task.defaultFindOption, {where: {projectId, id: taskId}}))
            .then(task => task.toJSON());
    }

    static findAll(projectId, options={}) {
        return db.Task.findAll(_.defaults(options, Task.defaultFindOption, {where: {projectId}}))
            .then(tasks => tasks.map(x => x.toJSON()));
    }

    static add(projectId, {title, body, stageId, userId, costId/*, labelId=[]*/}) {
        return co(function* () {
            const project = yield db.Project.findById(projectId);
            stageId = stageId || project.defaultStageId;

            yield Task._validateStageAndUser(projectId, stageId, userId, title);
            // TODO: check WIP limit

            return yield db.Task.create({
                projectId, title, body, userId, stageId,
                costId: costId || project.defaultCostId
            });
        });
    }

    static archive(projectId, taskId) {
        return co(function* () {
            const archiveStage = yield db.Stage.find({where: {projectId, name: 'archive'}});
            if (!archiveStage) {
                throw new Error(`archive stage is not found in ${projectId}`);
            }
            yield db.Task.update({stageId: archiveStage.id}, {where: {projectId, id: taskId}});
        });
    }

    // update title, body and/or costId
    static updateContent(projectId, taskId, {title, body, costId}) {
        const updateParams = {};
        _.forEach({title, body, costId}, (v, k) => {
            if (!_.isNil(v)) {
                updateParams[k] = v;
            }
        });
        return db.Task.update(updateParams, {where: {projectId, id: taskId}});
    }

    // update assignee and/or stage
    static updateStatus(projectId, taskId, {userId=null, stageId}) {
        return co(function* () {
            const task = yield db.Task.findById(taskId);

            yield Task._validateStageAndUser(projectId, stageId, userId, task.title);

            // cannot update status when task is working
            if (task.isWorking) {
                throw new Error(`cannot update status of a task when the task is working. ${task.title}`);
            }

            // TODO: check WIP limit

            yield db.Task.update({userId, stageId}, {where: {projectId, id: taskId}});
        });
    }

    // start or stop work
    static updateWorkingState(projectId, taskId, isWorking) {
        return co(function* () {
            const task = yield Task.findById(projectId, taskId);

            if (!task.stage.canWork) {
                throw new Error(`cannot change working when stage of task is ${task.stage.name} in ${projectId}. (${taskId})`);
            }

            yield db.Task.update({isWorking}, {where: {projectId, id: taskId}});

            if (isWorking) { // start
                yield db.Work.create({userId: task.user.id, taskId: task.id});
            } else { // stop
                const lastWork = _.find(task.works, {isEnded: false});
                if (!lastWork) {
                    throw new Error(`work is not found of ${taskId} in ${projectId}.`);
                }
                yield db.Work.update({isEnded: true, endTime: Date.now()}, {where: {id: lastWork.id}});
            }
        });
    }

    // update all work history
    static updateWorkHistory(projectId, taskId, workHistory) {

    }

    // update task order in project
    static updateOrder(projectId, taskId, beforeTaskId) {

    }

    // params.task is taskId,  taskTitle or others
    static _validateStageAndUser(projectId, stageId, userId, task) {
        return co(function* () {
            const stage = yield db.Stage.findOne({where: {projectId, id: stageId}});
            if (stage.assigned && !userId) {
                throw new Error(`no assignment is invalid with the stage(${stageId}) in ${projectId}. (${task})`);
            }
            if (!stage.assigned && userId) {
                throw new Error(`assignment is invalid with the stage(${stageId} in ${projectId}. (${task})`);
            }
        });
    }
}

module.exports = Task;