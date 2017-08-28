const fs = require('fs');
const path = require('path');

class Evaluator {
    constructor ({projectId}) {
        this.problems = this.constructor.ProblemClasses.map(ProblemClass =>
            new ProblemClass({projectId}));

        this.causes = this.constructor.CauseClasses.map(CauseClass =>
            new CauseClass({projectId}));

        this.solvers = this.constructor.SolverClasses.map(SolverClass =>
            new SolverClass({projectId}));
    }

    static get ProblemClasses () {
        return this._requires('problems');
    }

    static get CauseClasses () {
        return this._requires('causes');
    }

    static get SolverClasses () {
        return this._requires('solvers');
    }

    static _requires (dirname) {
        const dirPath = path.join(__dirname, dirname);
        return fs
            .readdirSync(dirPath)
            .filter(file => file.indexOf('.') !== 0)
            .filter(file => !file.endsWith('_abstract.js'))
            .map(file => require(path.join(dirPath, file)));
    }

    serialize () {
        return {
            problems: this.problems.map(problem => ({
                name: problem.constructor.name,
                causes: problem.causes.map(cause => cause.constructor.name)
            })),
            causes: this.causes.map(cause => ({
                name: cause.constructor.name,
                solvers: cause.solvers.map(solver => solver.constructor.name)
            })),
            solvers: this.solvers.map(solver => ({
                name: solver.constructor.name
            }))
        };
    }
}

module.exports = Evaluator;