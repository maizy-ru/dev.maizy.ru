// HabraImprover v1.0 beta
// 2008-08-26
// Copyright (c) 2008, Nikita Kovaliov, http://dev.maizy.ru, http://nikita.habrahabr.ru/
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html


// ==UserScript==
// @name           HabraImprover
// @namespace      http://userscripts.org/users/62694
// @description    Makes habrahabr.ru more usefull (IMHO).
// @include        http://*.habrahabr.ru/*
// @include        http://habrahabr.ru/*
// ==/UserScript==

/* TODO LIST 
	- навигация в "новых топиках"
	- смешать новые и захабренные и все вместе с навигацией
	- автоопределение кармы (но только чтобы с кэшем, а не отдельный запрос каждый раз)

*/


// FUCTIONS
	//http://javascript.about.com/library/bldom08.htm
	if (!document.getElementsByClassName){
		document.getElementsByClassName = function(cl) {
		var retnode = [];
		var myclass = new RegExp('\\b'+cl+'\\b');
		var elem = this.getElementsByTagName('*');
		for (var i = 0; i < elem.length; i++) {
		var classes = elem[i].className;
		if (myclass.test(classes)) retnode.push(elem[i]);
		}
		return retnode;
		}; 
	}
	//-	
	
	
	/* GM_xmlhttpRequest implementation adapted from the
		Turnabout GM compatibility library:
		http://www.reifysoft.com/turnabout.php
		Used under the following license:
		
		 Copyright (c) 2005, Reify Software, Inc.
		 All rights reserved.
		
		 Redistribution and use in source and binary forms,
		 with or without modification, are permitted provided
		 that the following conditions are met:
		
		 1) Redistributions of source code must retain the
			above copyright notice, this list of conditions
			and the following disclaimer.
		 2) Redistributions in binary form must reproduce the
			above copyright notice, this list of conditions
			and the following disclaimer in the documentation
			and/or other materials provided with the
			distribution.
		 3) Neither the name of the Reify Software, Inc. nor
			the names of its contributors may be used to
			endorse or promote products derived from this
			software without specific prior written permission.
		
		 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS
		 AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED    
		 WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
		 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
		 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
		 THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
		 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
		 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
		 USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
		 HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
		 IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
		 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
		 USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
		 OF SUCH DAMAGE.
		
		*/
	if (!window.GM_xmlhttpRequest) {
		
		 
		//yes, I know the domain limitations, but it's better than an outright error
		function GM_xmlhttpRequest(details) {
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				var responseState = {
					responseXML:(xmlhttp.readyState==4 ? xmlhttp.responseXML : ''),
					responseText:(xmlhttp.readyState==4 ? xmlhttp.responseText : ''),
					readyState:xmlhttp.readyState,
					responseHeaders:(xmlhttp.readyState==4 ? xmlhttp.getAllResponseHeaders() : ''),
					status:(xmlhttp.readyState==4 ? xmlhttp.status : 0),
					statusText:(xmlhttp.readyState==4 ? xmlhttp.statusText : '')
				}
				if (details["onreadystatechange"]) {
					details["onreadystatechange"](responseState);
				}
				if (xmlhttp.readyState==4) {
					if (details["onload"] && xmlhttp.status>=200 && xmlhttp.status<300) {
						details["onload"](responseState);
					}
					if (details["onerror"] && (xmlhttp.status<200 || xmlhttp.status>=300)) {
						details["onerror"](responseState);
					}
				}
			}
			try {
			  //cannot do cross domain
			  xmlhttp.open(details.method, details.url);
			} catch(e) {
			  if( details["onerror"] ) {
				//simulate a real error
				details["onerror"]({responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'});
			  }
			  return;
			}
			if (details.headers) {
				for (var prop in details.headers) {
					xmlhttp.setRequestHeader(prop, details.headers[prop]);
				}
			}
			xmlhttp.send((typeof(details.data)!='undefined')?details.data:null);
		}
	}
	// end of GM_Request
	function $defined(obj){
		return (obj != undefined)
	}
	function $(id) {
		var obj = window.document.getElementById(id)
		if (obj != undefined) {
			return obj
		} else {
			return false
		}
	}
	function $class(name,base) {
		base = base || document;
		return base.getElementsByClassName(name)
	}
	
	function $classFirst(name,base) {
		var res = $class(name,base)
		if (res[0]){
			return res[0]
		}else {
			return false
		}
	}
	
	function $clone(what) {
		for (i in what) {
			if (typeof what[i] == 'object') {
				this[i] = new $clone(what[i]);
			}
			else
				this[i] = what[i];
		}
	}

	function $clean(node) {
		if (node) {
			while (node.hasChildNodes()){
				node.removeChild(node.firstChild)
			}
		}
		return node
	}
	
	function setStyle(obj,property, value){
		obj.style[property] = value
		return obj
	}
	
	function hide(obj) {
		setStyle(obj, 'display','none')
		return obj
	}
// -
	
// URL
	var paths = String(window.location).split('/')
	var domainParts = String(paths[2]).split('.')
	var i,j,l,l2
	var tmp,tmp2
// -




// ОБЩИЙ БЛОК
	//реклама
	hide($('head-text-adv'))
	
	//здравствуй opera прощай js v1.6 =((
	tmp = $class('banner')
	for (i=0,l=tmp.length;i<l;i++) {
		hide(tmp[i])
	}
	
	//верхний блок не давиться, ставьте себе AdBlock и будет счастье 
	// (http://addons.mozilla.org/ru/firefox/addon/1865)
	
	
	tmp = $class('tag-cloud')
	for (i=0,l=tmp.length;i<l;i++) {
		hide(tmp[i])
	}
	//в подвал
	var note = document.createElement("LI")
	note.appendChild(document.createTextNode("| немного улучшено "))
	var link = document.createElement("A")
	with (link) {
		setAttribute('href','http://dev.maizy.ru')
		setAttribute('target','_blank')
		appendChild(document.createTextNode("Nikita (dev.maizy.ru)"))
	}
	note.appendChild(link)
	$('copyright-and-footer-nav').appendChild(note) //не, ну надо ж мне попиариться ;)
// -
	
	// ДЛЯ КАРМА-БОМЖЕЙ (не обижайтесь, я тоже такой)
	//стрелочки-голосовалки у топиков
	/*tmp = $class('entry-info-wrap')
	for (i=0,l=tmp.length;i<l;i++) {
		tmp2 = $class('vote_minus',tmp[i])
		for (j=0,l2=tmp2.length;j<l2;j++) {
			hide(tmp2[j])
		}
		tmp2 = $class('vote_plus',tmp[i])
		for (j=0,l2=tmp2.length;j<l2;j++) {
			hide(tmp2[j])
		}
	}
	
	//стрелочки-голосовалки у комментариев
	var comments = $('comments');
	if (comments) {
		tmp = $class('vote_minus',comments)
		for (i=0,l=tmp.length;i<l;i++) {
			hide(tmp[i])
		}
		
		tmp = $class('vote_plus',comments)
		for (i=0,l=tmp.length;i<l;i++) {
			hide(tmp[i])
		}
	}*/
// -

// TOPIC FEED
	var sideBar = $('sidebar')
	if (sideBar && domainParts && (domainParts[0] == 'habrahabr' || domainParts[0] == 'www')) {
		var trash = document.createElement('DIV')
		trash.setAttribute('id', 'cleanerTrash')
		setStyle(trash,'display','none')
		document.body.appendChild(trash)
		function loadNewTopics () { //подгрзука топиков
			/* 
			когда делал, подсмотрел кое-что у 
			habracut expander by bebopkid (http://userscripts.org/scripts/show/18059)
			*/
			var results = false			
			writeResults('load')
			try {
				var results = Array()
				GM_xmlhttpRequest({ //http://diveintogreasemonkey.org/api/gm_xmlhttprequest.html
					method: 'GET',
					url: 'http://habrahabr.ru/new/',
					
					onload: 
					function(resp) {
						if (resp && resp.status == 200) {
							trash.innerHTML = resp.responseText
							//ищем топики
							var finded = $class('hentry',trash)
							if (finded) {
								var timeReg = new RegExp('[0-9]{1,2}:[0-9]{1,2}','im')
								var time	= ''
								for (i=0,l=finded.length;i<l;i++) {
									topic = finded[i]
									time = $classFirst('published',topic).innerHTML // =(
									time = timeReg.exec(time)
									results.push({
										user: $classFirst('nickname',topic).firstChild.firstChild.data,
										userHref: $classFirst('nickname',topic).getAttribute('href'),
										blog: $classFirst('blog',topic).firstChild.data,
										blogHref: $classFirst('blog',topic).getAttribute('href'),
										topic: $classFirst('topic',topic).firstChild.data,
										topicHref: $classFirst('topic',topic).getAttribute('href'),
										time: time
									})
								}
							} else {
								writeResults('error')
							}
							
							//empty trash
							trash.innerHTML = ''
							
							writeResults('ok',results)
						} else {
							writeResults('error')
						}
					}
				})
			} catch(e) {
				writeResults('error')
			}
			
		}// EOFu
		
		
		//вывод списка
		function writeResults(type,results) {
			type = type || 'error'
			var link 	= $('topicFeedLink') 
			var linkDiv = link.parentNode
			var block 	= $('topicFeedInner')
			var list 	= $('topicFeedList')
			
			var loaderGif = 'data:image/gif;base64,R0lGODlhEAAQAPQAAP%2F%2F%2FwAAAPj4%2BDg4OISEhAYGBiYmJtbW1qioqBYWFnZ2dmZmZuTk5JiYmMbGxkhISFZWVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2FhpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh%2BQQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla%2BKIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK%2Bo2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC%2B0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU%2FNXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK%2BkCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm%2F4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg%2BboUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC%2BRAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA%3D%3D'
			var tmpContainer = document.createElement("DIV")
			tmpContainer.setAttribute('id','topicFeedList')
			
			switch (type) {
			case 'ok':
				/*
				<dl1>
					<dt2 class="who"><a href="link">xxx</a>&nbsp;&#8594;</dt>
					<dd2>
						<dl3>
							<dt4><a class="where" href="link">xxx</a>&nbsp;/</dt>
							<dd4><a class="topic" href="link">aaa</a>&nbsp;<span class="total">###</span></dd>
						</dl3>
					</dd2>
				</dl1>
	
				*/
				for (i=0,l=results.length;i<l;i++) { //добавляем топики
					topic=results[i]
					var dl1 = document.createElement("DL")
					
					var dt2Link = document.createElement("A")
					dt2Link.setAttribute('href',topic.userHref)
					dt2Link.appendChild(document.createTextNode(topic.user))
					var dt2 = document.createElement("DT")
					dt2.setAttribute('class','who')
					dt2.appendChild(dt2Link)
					dt2.appendChild(document.createTextNode(String.fromCharCode(160)+'→ '))
					
					var dt4Link = document.createElement("A")
					dt4Link.setAttribute('href',topic.blogHref)
					dt4Link.setAttribute('class','where')
					dt4Link.appendChild(document.createTextNode(topic.blog))
					var dt4 = document.createElement("DT")
					dt4.appendChild(dt4Link)
					dt4.appendChild(document.createTextNode(String.fromCharCode(160)+'/ '))
					
					var dd4Link = document.createElement("A")
					dd4Link.setAttribute('href',topic.topicHref)
					dd4Link.setAttribute('class','topic')
					dd4Link.appendChild(document.createTextNode(topic.topic))
					var dd4Span = document.createElement("SPAN")
					dd4Span.setAttribute('class','total')
					dd4Span.appendChild(document.createTextNode(topic.time))
					var dd4 = document.createElement("DD")
					dd4.appendChild(dd4Link)
					dd4.appendChild(document.createTextNode(String.fromCharCode(160)))
					dd4.appendChild(dd4Span)
					
					var dl3 = document.createElement("DL")
					dl3.appendChild(dt4)
					dl3.appendChild(dd4)
					
					var dd2 = document.createElement("DD")
					dd2.appendChild(dl3)
					
					
					dl1.appendChild(dt2)
					dl1.appendChild(dd2)
					
					tmpContainer.appendChild(dl1)
				}
				link.replaceChild(document.createTextNode('обновить'),link.firstChild)
			break;
			
			
			case 'error'://нет результатов
				var errorDiv = document.createElement('DIV')
				setStyle(errorDiv,'paddingLeft','20px')
				setStyle(errorDiv,'color','#f00')
				errorDiv.appendChild(document.createTextNode('Что-то не прошло =('))
				tmpContainer.appendChild(errorDiv)
				link.replaceChild(document.createTextNode('ещё разок'),link.firstChild)
			break;
				
			case 'load':
				var loadDiv = document.createElement('DIV')
				setStyle(loadDiv,'paddingLeft','20px')
				var loader 	= document.createElement('IMG')
				loader.setAttribute('src',loaderGif)
				loadDiv.appendChild(loader)
				loadDiv.appendChild(document.createTextNode(' загрузка ...'))
				tmpContainer.appendChild(loadDiv)
			break;
			}
			list = list.parentNode.replaceChild(tmpContainer,list)
		}// EOFu
		
		
		//создание блока с топиками
		var inner = document.createElement("DIV") 	//вот в этот блок всё и будем сваливать
		inner.setAttribute('class','bg-bott-l')
		inner.setAttribute('id','topicFeedInner')
		var wrapper = document.createElement("DIV") //врапер для уголков
		wrapper.setAttribute('class','bg-bott-r')
		wrapper.appendChild(inner)
		
		var title = document.createElement("H3") 	//тайтл
		title.appendChild(document.createTextNode('Не захабренные ↓'))
		inner.appendChild(title)
		
		var topics =document.createElement("DIV") 	//для результата
		topics.setAttribute('id','topicFeedList')
		inner.appendChild(topics)
		
		var link = document.createElement("A")		//линк
		with (link) {
			addEventListener('click',loadNewTopics,false)
			setAttribute('onClick','return false')
			setAttribute('href','#')
			setAttribute('id','topicFeedLink')
			appendChild(document.createTextNode('показать'))
		}
		var linkDiv = document.createElement("DIV")
		linkDiv.setAttribute('class','all')
		linkDiv.appendChild(link)
		inner.appendChild(linkDiv)
		
		
		var feed = document.createElement("DIV")	//добавляем результат
		with (feed) {
			setAttribute('id', 'topicFeed')
			setAttribute('class', 'live new-feedbacks')
			appendChild(wrapper)
		}
		sideBar.insertBefore(feed, sideBar.firstChild)
		
		
		//autoload в основной ленте
		if (!paths[3] || String(paths[3]).substr(0,4) == 'page') {
			loadNewTopics()
		}
	}

// -




//HABRA EXPANDER
	/* 
	идея - habracut expander by bebopkid (http://userscripts.org/scripts/show/18059)
	*/
	
	function expandTopic() {
		var link = this
		var linkDiv = link.parentNode
		var hentry = linkDiv.parentNode.parentNode.parentNode // =)
		var content = $classFirst('content',hentry)
		
		var loaderGif = 'data:image/gif;base64,R0lGODlhEAAQAPQAAP%2F%2F%2FwAAAPj4%2BDg4OISEhAYGBiYmJtbW1qioqBYWFnZ2dmZmZuTk5JiYmMbGxkhISFZWVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2FhpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh%2BQQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla%2BKIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK%2Bo2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC%2B0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU%2FNXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK%2BkCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm%2F4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg%2BboUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC%2BRAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA%3D%3D'

		var loader 	= document.createElement('IMG')
		setStyle(loader,'verticalAlign','middle')
		setStyle(loader,'marginRight','4px')
		link.replaceChild(document.createTextNode('загрузка'),link.firstChild)
		loader.setAttribute('src',loaderGif)
		
		linkDiv.insertBefore(loader,linkDiv.firstChild)
		
		try {
			GM_xmlhttpRequest({ //http://diveintogreasemonkey.org/api/gm_xmlhttprequest.html
				method: 'GET',
				url: link.getAttribute('_topicHref'),
				onload: 
				function(resp) {
					if (resp && resp.status == 200) {
						var trash = document.createElement('DIV')
						setStyle(trash,'display','none')
						document.body.appendChild(trash)
						
						trash.innerHTML = resp.responseText
						//ищем содержание
						var newContent = $classFirst('content',trash)
						if (newContent) {
							content.parentNode.replaceChild(newContent,content)
							linkDiv.parentNode.removeChild(linkDiv)
						}
						//empty trash
						trash.innerHTML = ''
					}
				}
			})
		} catch(e) {
			var errorDiv = document.createElement('DIV')
			errorDiv.appendChild(document.createTextNode('Не удалось развернуть =( Используйте ссылку'))
			setStyle(errorDiv,'color','#f00')
			content.appendChild(errorDiv)
			linkDiv.parentNode.removeChild(linkDiv)
		}
		
	}
	
	tmp = $class('hentry')
	for (i=0,l=tmp.length;i<l;i++) {
		hentry=tmp[i]
		var cutDiv = $classFirst('habracut',hentry)
		if (cutDiv) {
			var wrapper = $classFirst('entry-info-wrap',hentry)
			
			var expandLink = document.createElement("A")
			with (expandLink) {
				addEventListener('click',expandTopic,false)
				setAttribute('onClick','return false')
				setAttribute('href','#')
				setAttribute('_topicHref',$classFirst('habracut',cutDiv).href)
				appendChild(document.createTextNode('развернуть'))
			}
			setStyle(expandLink,'color','#555')
			
			var expand = document.createElement("DIV") 	//для результата
			expand.appendChild(expandLink)
			
			wrapper.appendChild(expand)
		}
	}
// -	