db.getCollection('orders').update({}, {$set:{promoCode:{code: '', count: 0}, actualMoney: 0}}, {multi:true})

试题上传条件: 
  1、已发布、建设中课程可上传(不上传)，已上传可编辑
  2、建设中课程可取消试题，发布且卖出则不可取消，可编辑 (隐藏选择CheckBox)

播放页测试:
  1、状态: 不显示，可测试，查看成绩，重新测试

我的课程(学习记录查看):

我的订单:
  1、学习完成进度根据视频是否出现完成提示

主要课程、课时、学员、订单联系


考题:
  讲师发布课程和试题    examTpl.js   course.js
    examTpl: 课程id, 课程名称, 课时id, 课时标题, 试题id, 试题题目, 选项内容, 试题答案, 课时讲师id,讲师姓名, 创建时间, 更新时间
    course: 课时题库id, 学员试卷id(课时)

  课程播放: myCourse.js studentExam.js
    myCourse: 课时总长
    studentExam: 学员试卷id(课时), 课时标题, 课程id, 学员id, 学员姓名, 题目id, 题目标题, 选项内容, 学员答案, 题库答案, 成绩, 创建时间, 更新时间

  我的课程: myCourse.js 
    myCourse: 课时总长, 是否完成根据播放进度和课时总长比较。
  
  我的订单: orders.js myCourse.js
    orders: 受赠人员id, 受赠人员姓名, 受赠人员邮箱, 受赠人员昵称, 赠送课程id, 
    orders.js --> myCourse.js --> studentExam.js
