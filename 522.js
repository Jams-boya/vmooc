import { myRender } from './common';
import CourseDal from '../dal/courseDal';
import ExpertDal from '../dal/expertDal';
import ExpertQaDal from '../dal/expertQaDal';
import eventproxy from 'eventproxy'

function test(cval, examTplId, userId, courseId, tidx, cidx) {
  return new Promise((resolve, reject) => {
    CourseDal.isHasTest(cval, examTplId, userId, courseId, tidx, cidx, (error, cdata) => {
      if (error) {
        return reject(error)
      }
      cval["result"] = cdata.result;
      cval["examData"] = cdata.examData;
      return resolve(cval);
    });
  })
}

export default {
  /**
   * 视频播放页面入口
   * @author: wac
   */
  playerEntry(req, res, next) {
    let playId = req.params.id;
    let cidx = 0;
    let index = 0;
    if (req.query.cidx)
      cidx = req.query.cidx;
    if (req.query.index)
      index = req.query.index;
    myRender(req, res, 'player/player', { courseId: playId, cidx: cidx, index: index, title: '播放页' });
  },

  /**
   * 获取播放的课程详细信息
   * @author: wac
   */
  CourseDetails(req, res, next) {
    let courseId = req.query.courseId;
    let userId = req.session.user._id;
    CourseDal.courseDetails(courseId, (err, data) => {
      if (err) {
        myRender(req, res, '404');
      } else {
        data = data.toObject();
        if (data && data.isMicroCourse) {
          res.setHeader('Cache-Control', 'no-cache');
          res.json(data);
        } else {
          const ep = new eventproxy();
          ep.after('newToc', data.toc.length, tocResult => {
            console.log('1....', data.toc[0].clazz[0]);
            console.log('2....', data.toc[0].clazz[1]);
            console.log('3....', data.toc[1].clazz[0]);
            // console.log('tocResult', tocResult);
            res.setHeader('Cache-Control', 'no-cache');
            res.json(data);
          });
          const epp = new eventproxy();
          data.toc.map(async (tval, tidx) => {
            epp.after('newClazz', tval.clazz.length, clazzResult => {
              ep.emit('newToc', clazzResult);
            });
            for (let i = 0; i < tval.clazz.length; i++) {
              console.log('tv', tval.clazz[i]);
              if (tval.clazz[i].isHasExam) {
                try {
                  epp.emit('newClazz', await test(tval.clazz[i], tval.clazz[i].examTplId, userId, courseId, tidx, i))
                } catch (error) {
                  console.log('error', error);
                }
              } else {
                tval.clazz[i]["result"] = 0;
                epp.emit('newClazz', cval);
              }
            }
          })
        }
      }
    });
  },

  /**
   * 校验用户是否已购买当前课程
   * @author: bs
   */
  CourseCheck(req, res, next) {
    let userId = req.session.user._id;
    let courseId = req.query.courseId;
    CourseDal.courseCheck(userId, courseId, (err, count) => {
      if (err) {
        myRender(req, res, '500');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(count);
      }
    });
  },

  /**
  * 根据讲师id获取讲师信息及讲师问答信息
  * @author: bs
  */
  getTeacherInfoById(req, res, next) {
    let teacherId = req.query.teacherId;
    let courseId = req.query.courseId;
    let ep = new eventproxy();
    ep.all('getTeacher', 'getQA', (teacher, qa) => {
      let result = {
        teacher: teacher,
        qa: qa,
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(result);
    });
    ExpertQaDal.coursesQa(courseId, (err, qa) => {
      ep.emit('getQA', qa);
    });
    ExpertDal.expertInfo(teacherId, (err, teacher) => {
      ep.emit('getTeacher', teacher);
    });
  },
}