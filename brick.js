window.onload = function(){

	let ballMoveSettings = {
		"isLeft": false,
		"isUp": true,
		"tan": Math.tan((2*Math.PI/360) * 30)
	};

	/*
	 * 设置小球移动属性
	 * isLeft 是否向左移动 true/false
	 * isUp 是否向上移动 true/false
	 * tan left 和 up 每次增减的比例 float
	 */
	function ballMoveSet(isLeft, isUp, tan){
		if(typeof isLeft == "boolean"){
			ballMoveSettings.isLeft = isLeft;
		}
		if(typeof isUp == "boolean"){
			ballMoveSettings.isUp = isUp;
		}
		if(tan){
			ballMoveSettings.tan = tan;
		}
	}

	/*
	 * 小球下一步的移动
	 * isUp 是否向上 true/false
	 * isLeft 是否向左 true/false
	 * ballStl 小球的 DOM Style 对象
	 * tan left 和 up 每次增减的比例 float
	 */
	function ballMove(isUp, isLeft, ballStl, tan){
		if(!isUp){
			ballStl.top = parseFloat(ballStl.top) + (2 * tan) + "px";
			if(!isLeft){
				ballStl.left = parseFloat(ballStl.left) + 2 + "px";
			}else{
				ballStl.left = parseFloat(ballStl.left) - 2 + "px";
			}
		}else if(isUp){
			ballStl.top = parseFloat(ballStl.top) - (2 * tan) + "px";
			if(!isLeft){
				ballStl.left = parseFloat(ballStl.left) + 2 + "px";
			}else{
				ballStl.left = parseFloat(ballStl.left) - 2 + "px";
			}
		}
	}

	/*
	 * 模拟砖块被打碎
	 * brick 砖块元素 DOM
	 */
	function breakBrick(brick){
		if(!brick){
			throw new Error("Not a Brick");
		}
		brick.style.background = "url(boom.jpg) no-repeat center";
		brick.style.backgroundSize = "contain";
		setTimeout(function(){
			brick.style.visibility = "hidden";
		}, 200);
	}

	/*
	 * 重新设置 tan
	 */
	function resetTan(){
		var randomAngle = parseFloat(Math.random().toString().substr(2, 2));
		while(randomAngle > 45){
			randomAngle = parseFloat(Math.random().toString().substr(2, 2));
		}
		ballMoveSet(undefined, undefined, Math.tan((2*Math.PI/360) * randomAngle));
	}

	/*
	 * 小球碰到其他物体
	 * isBrick 是否是砖块 true/false
	 * brick 砖块元素 DOM
	 * bLeft 小球的 left float
	 * bTop 小球的 top float
	 * bWidth 小球的 width float
	 * bHeight 小球的 height float
	 */
	function ballCollisionOthers(isBrick, brick, bLeft, bTop, bWidth, bHeight){
		// 碰左边
		if((bLeft+bWidth)>=brick.offsetLeft && bLeft<=brick.offsetLeft && (bTop+bHeight)>=brick.offsetTop && bTop<=(brick.offsetTop+brick.offsetHeight)){
			ballMoveSet(true, undefined, undefined);

			if(isBrick){
				breakBrick(brick);
				resetTan();
			}
		}
		// 碰右边
		if((bLeft+bWidth)>=(brick.offsetLeft+brick.offsetWidth) && bLeft<=(brick.offsetLeft+brick.offsetWidth) && (bTop+bHeight)>=brick.offsetTop && bTop<=(brick.offsetTop+brick.offsetHeight)){
			ballMoveSet(false, undefined, undefined);

			if(isBrick){
				breakBrick(brick);
				resetTan();
			}
		}
		// 碰上边
		if((bLeft+bWidth)>=brick.offsetLeft && bLeft<=(brick.offsetLeft+brick.offsetWidth) && (bTop+bHeight)>=brick.offsetTop && bTop<=brick.offsetTop){
			ballMoveSet(undefined, true, undefined);

			if(isBrick){
				breakBrick(brick);
				resetTan();
			}
		}
		// 碰下边
		if((bLeft+bWidth)>=brick.offsetLeft && bLeft<=(brick.offsetLeft+brick.offsetWidth) && (bTop+bHeight)>=(brick.offsetTop+brick.offsetHeight) && bTop<=(brick.offsetTop+brick.offsetHeight)){
			ballMoveSet(undefined, false, undefined);

			if(isBrick){
				breakBrick(brick);
				resetTan();
			}
		}
	}

	/*
	 * 游戏开始
	 * ball 小球元素 DOM
	 * isUp 是否向上 true/false
	 * isLeft 是否向左 true/false
	 * tan 小球的 left 和 up 每次增减的比例 float
	 */
	function run(ball, isUp, isLeft, tan){
		let ballStl = ball.style;

		// 设置小球移动属性
		ballMoveSet(isLeft, isUp, tan);

		// 小球接下来要移动的方向、距离
		ballMove(ballMoveSettings.isUp, ballMoveSettings.isLeft, ballStl, ballMoveSettings.tan);

		// 判断是否碰到砖块
		var bricks = [...document.querySelectorAll("div")],
			bLeft =	parseFloat(ballStl.left),
			bWidth = parseFloat(ballStl.width),
			bTop = parseFloat(ballStl.top),
			bHeight = parseFloat(ballStl.height);
		for(let [, brick] of bricks.entries()){
			// 已经打烂的砖块不会产生碰撞
			if(brick.style.visibility == "hidden"){
				continue;
			}

			let isBrick = false;
			if(brick.className.indexOf("brick") != -1){
				isBrick = true;
			}
			ballCollisionOthers(isBrick, brick, bLeft, bTop, bWidth, bHeight);
		}

		// 是否碰到边界
		reachBoundary(ball, bLeft, bWidth, bTop, bHeight);

		setTimeout(function(){
			run(ball, ballMoveSettings.isUp, ballMoveSettings.isLeft, ballMoveSettings.tan);
		}, 5);
	}

	/*
	 * 是否碰到边界
	 * ball 小球元素 DOM
	 * bLeft 小球 left float
	 * bWidth 小球 width float
	 * bTop 小球 height float
	 */
	function reachBoundary(ball, bLeft, bWidth, bTop, bHeight){
		if(bLeft <= 0){
			ballMoveSet(false, undefined, undefined);
		}
		if(bLeft+bWidth >= ball.parentNode.clientWidth){
			ballMoveSet(true, undefined, undefined);
		}
		if(bTop <= 0){
			ballMoveSet(undefined, false, undefined);
		}
		if(bTop+bHeight >= ball.parentNode.clientHeight){
			ballMoveSet(undefined, true, undefined);
		}
	}

	/*
	 * 挡板移动
	 * baffle 挡板 type 原生 DOM 元素对象
	 * isLeft 是否向左移动 true/false
	 * moveStep 每次移动的距离 int
	 */
	function baffleMove(baffle, isLeft, moveStep){
		if(!baffle.style.left){
			baffle.style.left = baffle.offsetLeft + "px";
			baffle.style.marginLeft = "0";
		}
		if(isLeft){
			// 左滑动
			if(parseFloat(baffle.style.left) <= 0){
				return;
			}
			baffle.style.left = parseFloat(baffle.style.left) - moveStep + "px";
		}else{
			// 右滑动
			if(parseFloat(baffle.style.left) + parseFloat(baffle.offsetWidth) >= baffle.offsetParent.clientWidth){
				return;
			}
			baffle.style.left = parseFloat(baffle.style.left) + moveStep + "px";
		}

	}

	// 挡板滑动事件
	document.onkeydown = function(e){
		var keynum, 
			keychar, 
			baffle = document.getElementById("baffle");	

		if(window.event){
			// IE
			keynum = e.keyCode;
		}else if(e.which){
			keynum = e.which;
		}

		if(keynum == 37){
			// 左滑动
			baffleMove(baffle, true, 20);
		}
		if(keynum == 39){
			// 右滑动
			baffleMove(baffle, false, 20);
		}
	}

	// 开始运动
	run(document.getElementById("ball"), true, false, Math.tan((2*Math.PI/360) * 30));
}
