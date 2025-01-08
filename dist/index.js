"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var core = require("@actions/core");
var openai_1 = require("openai");
var rest_1 = require("@octokit/rest");
var parse_diff_1 = require("parse-diff");
var minimatch_1 = require("minimatch");
var GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
var OPENAI_API_KEY = core.getInput("OPENAI_API_KEY");
var OPENAI_API_MODEL = core.getInput("OPENAI_API_MODEL");
var SYSTEM_MESSAGE = core.getInput("INSTRUCTIONS");
var octokit = new rest_1.Octokit({ auth: GITHUB_TOKEN });
var SUPPORTS_JSON_FORMAT = [
    "gpt-4o",
    "gpt-4-turbo-preview",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "gpt-4-0125-preview",
    "gpt-4-1106-preview",
    "gpt-3.5-turbo-0125",
    "gpt-3.5-turbo-1106",
];
var openai = new openai_1.default({
    apiKey: OPENAI_API_KEY,
});
function getPRDetails() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, repository, number, prResponse;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = JSON.parse((0, fs_1.readFileSync)(process.env.GITHUB_EVENT_PATH || "", "utf8")), repository = _a.repository, number = _a.number;
                    return [4 /*yield*/, octokit.pulls.get({
                            owner: repository.owner.login,
                            repo: repository.name,
                            pull_number: number,
                        })];
                case 1:
                    prResponse = _d.sent();
                    return [2 /*return*/, {
                            owner: repository.owner.login,
                            repo: repository.name,
                            pull_number: number,
                            title: (_b = prResponse.data.title) !== null && _b !== void 0 ? _b : "",
                            description: (_c = prResponse.data.body) !== null && _c !== void 0 ? _c : "",
                        }];
            }
        });
    });
}
function getDiff(owner, repo, pull_number) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.get({
                        owner: owner,
                        repo: repo,
                        pull_number: pull_number,
                        mediaType: { format: "diff" },
                    })];
                case 1:
                    response = _a.sent();
                    // @ts-expect-error - response.data is a string
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function analyzeCode(parsedDiff, prDetails) {
    return __awaiter(this, void 0, void 0, function () {
        var comments, _i, parsedDiff_1, file, _a, _b, chunk, prompt_1, aiResponse, newComments;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    comments = [];
                    _i = 0, parsedDiff_1 = parsedDiff;
                    _c.label = 1;
                case 1:
                    if (!(_i < parsedDiff_1.length)) return [3 /*break*/, 6];
                    file = parsedDiff_1[_i];
                    if (file.to === "/dev/null")
                        return [3 /*break*/, 5]; // Ignore deleted files
                    _a = 0, _b = file.chunks;
                    _c.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 5];
                    chunk = _b[_a];
                    prompt_1 = createPrompt(file, chunk, prDetails);
                    return [4 /*yield*/, getAIResponse(prompt_1)];
                case 3:
                    aiResponse = _c.sent();
                    if (aiResponse) {
                        newComments = createComment(file, chunk, aiResponse);
                        if (newComments) {
                            comments.push.apply(comments, newComments);
                        }
                    }
                    _c.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, comments];
            }
        });
    });
}
function createPrompt(file, chunk, prDetails) {
    var RESPONSE_FORMAT = "Response Instructions:\n- Provide your response in the following JSON format: {\"reviews\": [{\"lineNumber\":  <line_number>, \"reviewComment\": \"<review comment>\"}]}\n- Provide comments and suggestions ONLY if there are errors, otherwise \"reviews\" should be an empty array.\n- Write the comment in GitHub Markdown format.\n- Use the given description only for the overall context and only comment the code.\n\nReview the following code diff in the file \"".concat(file.to, "\" and take the pull request title and description into account when writing the response.\n  \nPull request title: ").concat(prDetails.title, "\nPull request description:\n\n---\n").concat(prDetails.description, "\n---\n\nGit diff to review:\n\n```diff\n").concat(chunk.content, "\n").concat(chunk.changes
        // @ts-expect-error - ln and ln2 exists where needed
        .map(function (c) { return "".concat(c.ln ? c.ln : c.ln2, " ").concat(c.content); })
        .join("\n"), "\n```\n");
    return SYSTEM_MESSAGE.concat(RESPONSE_FORMAT);
}
function getAIResponse(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var queryConfig, response, res, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    queryConfig = {
                        model: OPENAI_API_MODEL,
                        temperature: 0.2,
                        max_tokens: 700,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                    };
                    console.log("Awaiting response....");
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.chat.completions.create(__assign(__assign(__assign({}, queryConfig), (SUPPORTS_JSON_FORMAT.includes(OPENAI_API_MODEL)
                            ? { response_format: { type: "json_object" } }
                            : {})), { messages: [
                                {
                                    role: "system",
                                    content: prompt,
                                },
                            ] }))];
                case 2:
                    response = _c.sent();
                    res = ((_b = (_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim()) || "{}";
                    return [2 /*return*/, JSON.parse(res).reviews];
                case 3:
                    error_1 = _c.sent();
                    console.error("ERROR:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createComment(file, chunk, aiResponses) {
    return aiResponses.flatMap(function (aiResponse) {
        if (!file.to) {
            return [];
        }
        return {
            body: aiResponse.reviewComment,
            path: file.to,
            line: Number(aiResponse.lineNumber),
        };
    });
}
function createReviewComment(owner, repo, pull_number, comments) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.createReview({
                        owner: owner,
                        repo: repo,
                        pull_number: pull_number,
                        comments: comments,
                        event: "COMMENT",
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var prDetails, diff, eventData, newBaseSha, newHeadSha, response, parsedDiff, excludePatterns, filteredDiff, comments;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getPRDetails()];
                case 1:
                    prDetails = _c.sent();
                    console.log("EVENT PATH: ", (_a = process.env.GITHUB_EVENT_PATH) !== null && _a !== void 0 ? _a : "", "utf8");
                    eventData = JSON.parse((0, fs_1.readFileSync)((_b = process.env.GITHUB_EVENT_PATH) !== null && _b !== void 0 ? _b : "", "utf8"));
                    if (!(eventData.action === "opened")) return [3 /*break*/, 3];
                    return [4 /*yield*/, getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number)];
                case 2:
                    diff = _c.sent();
                    return [3 /*break*/, 6];
                case 3:
                    if (!(eventData.action === "synchronize")) return [3 /*break*/, 5];
                    newBaseSha = eventData.before;
                    newHeadSha = eventData.after;
                    return [4 /*yield*/, octokit.repos.compareCommits({
                            headers: {
                                accept: "application/vnd.github.v3.diff",
                            },
                            owner: prDetails.owner,
                            repo: prDetails.repo,
                            base: newBaseSha,
                            head: newHeadSha,
                        })];
                case 4:
                    response = _c.sent();
                    diff = String(response.data);
                    return [3 /*break*/, 6];
                case 5:
                    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
                    return [2 /*return*/];
                case 6:
                    if (!diff) {
                        console.log("No diff found");
                        return [2 /*return*/];
                    }
                    parsedDiff = (0, parse_diff_1.default)(diff);
                    excludePatterns = core
                        .getInput("exclude")
                        .split(",")
                        .map(function (s) { return s.trim(); });
                    filteredDiff = parsedDiff.filter(function (file) {
                        return !excludePatterns.some(function (pattern) { var _a; return (0, minimatch_1.default)((_a = file.to) !== null && _a !== void 0 ? _a : "", pattern); });
                    });
                    return [4 /*yield*/, analyzeCode(filteredDiff, prDetails)];
                case 7:
                    comments = _c.sent();
                    if (!(comments.length > 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, createReviewComment(prDetails.owner, prDetails.repo, prDetails.pull_number, comments)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("MAIN ERROR:", error);
    process.exit(1);
});
